from celery import Celery
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Native Windows without Redis will not support Celery broker properly.
# We explicitly isolate this limitation.

def get_celery_app():
    if not settings.REDIS_URL:
        logger.warning("REDIS_URL not configured. Celery background jobs will fail or run synchronously.")
        
    app = Celery(
        "mota_worker",
        broker=str(settings.REDIS_URL) if settings.REDIS_URL else "memory://",
        backend=str(settings.REDIS_URL) if settings.REDIS_URL else "db+sqlite:///celery_results.sqlite"
    )
    
    app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_always_eager=settings.APP_ENV == "development" and not settings.REDIS_URL
    )
    
    return app

celery_app = get_celery_app()

@celery_app.task
def process_document_ocr_task(document_version_id: str):
    """
    Placeholder for the background OCR task.
    """
    logger.info(f"Processing document version {document_version_id}...")
    pass

@celery_app.task(bind=True, max_retries=3)
def test_task_success(self, arg1: int):
    return arg1 * 2

@celery_app.task(bind=True, max_retries=3)
def test_task_failure_retry(self):
    try:
        if self.request.retries < 2:
            raise Exception("Failing intentionally to trigger retry")
        return "Success after retry"
    except Exception as exc:
        raise self.retry(exc=exc, countdown=1)

@celery_app.task(bind=True, max_retries=3)
def run_verification_task(self, run_id: str, actor_id: str, actor_role: str):
    from app.db.session import SessionLocal
    from app.services.verification_service import VerificationService
    from app.models.verification import VerificationRun, VerificationFinding, Deficiency
    from app.models.verification import EvidenceRecord as DBEvidenceRecord
    from app.models.document import DocumentVersion
    from app.core.storage import get_storage_provider
    from ai.document_intelligence.pipeline import DocumentPipeline
    from ai.cross_validation.engine import CrossValidationEngine
    from policy_engine.evaluator import PolicyEvaluator
    from ai.deficiency.engine import DeficiencyEngine
    from ai.evidence.engine import EvidenceEngine
    from ai.deficiency.schemas import OperationalStatus
    import uuid
    import tempfile
    import os
    import hashlib

    try:
        db = SessionLocal()
    except Exception:
        return

    try:
        from app.models.application import Application
        run = db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
        if not run:
            return

        app = db.query(Application).filter(Application.id == run.application_id).first()
        if not app:
            return

        storage = get_storage_provider()

        doc_pipeline = DocumentPipeline()
        cv_engine = CrossValidationEngine()
        policy_evaluator = PolicyEvaluator()
        deficiency_engine = DeficiencyEngine()
        evidence_engine = EvidenceEngine()

        extracted_docs = []

        # ── Phase 1: Document Intelligence ───────────────────────────────
        for doc_id_str, doc_version_id_str in run.input_document_references.items():
            dv = db.query(DocumentVersion).filter(DocumentVersion.id == doc_version_id_str).first()
            if not dv:
                continue

            file_bytes = storage.get_document_bytes(dv.storage_key)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name

            try:
                result = doc_pipeline.process_document(tmp_path, doc_id_str, str(app.id))
                extracted_docs.append(result.model_dump())
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)

        # ── Phase 2: Cross-Document Validation ───────────────────────────
        cv_findings = cv_engine.validate_application(str(app.id), extracted_docs)
        cv_findings_dicts = [f.model_dump() for f in cv_findings]

        # ── Phase 3: Policy Engine ───────────────────────────────────────
        validation_data_for_policy = {"documents": extracted_docs}
        policy_summary = policy_evaluator.evaluate(
            str(app.id), app.submitted_data or {}, validation_data_for_policy
        )
        policy_eval_dicts = [e.model_dump() for e in policy_summary.rule_evaluations]

        # ── Phase 4: Deficiency Engine ───────────────────────────────────
        operational_summary = deficiency_engine.process_application(
            application_id=str(app.id),
            validations=cv_findings_dicts,
            policies=policy_eval_dicts
        )
        deficiencies_dicts = [d.model_dump() for d in operational_summary.deficiencies]
        exceptions_dicts = [e.model_dump() for e in operational_summary.exceptions]

        # ── Phase 5: Evidence Engine ─────────────────────────────────────
        chains = evidence_engine.process_application(
            application_id=str(app.id),
            validations=cv_findings_dicts,
            policies=policy_eval_dicts,
            deficiencies=deficiencies_dicts,
            exceptions=exceptions_dicts
        )

        # ── Phase 6: Persist to Database ─────────────────────────────────
        db_finding_map = {}  # source_identifier -> DB finding UUID

        # 6a. Cross-Validation Findings
        for cv_f in cv_findings:
            db_finding = VerificationFinding(
                verification_run_id=run.id,
                finding_type="DOCUMENT_VALIDATION",
                status=cv_f.status,
                source_identifier=cv_f.validation_type,
                details=cv_f.model_dump()
            )
            db.add(db_finding)
            db.flush()
            db_finding_map[cv_f.validation_type] = db_finding.id

        # 6b. Policy Evaluation Findings
        for p_eval in policy_summary.rule_evaluations:
            db_finding = VerificationFinding(
                verification_run_id=run.id,
                finding_type="POLICY_EVALUATION",
                status=p_eval.status,
                source_identifier=p_eval.rule_id,
                details=p_eval.model_dump()
            )
            db.add(db_finding)
            db.flush()
            db_finding_map[p_eval.rule_id] = db_finding.id

        # 6c. Deficiencies
        for d in operational_summary.deficiencies:
            db_def = Deficiency(
                verification_run_id=run.id,
                application_id=app.id,
                deficiency_type=d.deficiency_type,
                status="OPEN",
                source_finding_id=db_finding_map.get(d.source_id)
            )
            db.add(db_def)

        # 6d. Evidence Records
        for chain in chains:
            # Best-effort finding_id mapping
            finding_id = db_finding_map.get(chain.rule.rule_id if chain.rule else None)
            if not finding_id:
                # Fallback: use first available finding for this run
                finding_id = next(iter(db_finding_map.values()), None)

            if not finding_id:
                continue  # No findings at all, skip evidence

            for ev in chain.evidence:
                # EvidenceRecord from ai/evidence/schemas.py uses evidence_location
                loc = ev.evidence_location
                doc_id_from_ev = loc.document_id if loc else None
                # Map AI document_id → stored document_version_id
                dv_id = run.input_document_references.get(doc_id_from_ev) if doc_id_from_ev else None
                # Construct a deterministic evidence hash
                ev_hash = hashlib.sha256(
                    f"{run_id}:{ev.evidence_id}:{ev.observed_value}".encode()
                ).hexdigest()

                db_ev = DBEvidenceRecord(
                    finding_id=finding_id,
                    document_version_id=dv_id,
                    page=loc.page if loc else None,
                    field=loc.field if loc else None,
                    extracted_value=ev.observed_value,
                    confidence=ev.extraction_confidence,
                    evidence_hash=ev_hash
                )
                db.add(db_ev)

        db.commit()

        # ── Phase 7: Complete Verification Run ───────────────────────────
        # Determine success: no blocking/high deficiencies → READY_FOR_OFFICER
        service = VerificationService(db)
        success = (operational_summary.operational_status == OperationalStatus.NO_DEFICIENCY)

        # Store result summary on the run
        run = db.query(VerificationRun).filter(VerificationRun.id == run_id).first()
        if run:
            run.result_summary = {
                "operational_status": operational_summary.operational_status.value,
                "total_deficiencies": operational_summary.total_deficiencies,
                "blocking_count": operational_summary.blocking_count,
                "high_count": operational_summary.high_count,
                "medium_count": operational_summary.medium_count,
                "low_count": operational_summary.low_count,
                "manual_review_count": operational_summary.manual_review_count,
                "policy_pass": policy_summary.pass_count,
                "policy_fail": policy_summary.fail_count,
                "policy_manual_review": policy_summary.manual_review_count,
            }
            db.commit()

        service.complete_verification(uuid.UUID(run_id), actor_id, actor_role, success=success)

    except Exception as exc:
        db.rollback()
        logger.error(f"Verification pipeline failed: {exc}", exc_info=True)
        try:
            service = VerificationService(db)
            service.complete_verification(uuid.UUID(run_id), actor_id, actor_role, success=False, error=str(exc))
        except Exception as inner_exc:
            logger.error(f"Failed to mark verification as failed: {inner_exc}", exc_info=True)
        raise self.retry(exc=exc, countdown=5)
    finally:
        db.close()

