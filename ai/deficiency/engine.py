from typing import List, Dict, Any
from datetime import datetime, timezone
import hashlib

from .schemas import (
    DeficiencyRecord,
    ExceptionRecord,
    ApplicationOperationalSummary,
    OperationalStatus,
    Severity,
    DeficiencyCategory,
    DeficiencyType
)
from .classifier import classify_validation_finding, classify_policy_finding
from .action_mapper import get_action_guidance
from .exception_classifier import classify_exception

class DeficiencyEngine:
    def __init__(self):
        pass

    def _generate_id(self, prefix: str, app_id: str, seed: str) -> str:
        hash_val = hashlib.sha256(f"{app_id}_{seed}".encode()).hexdigest()[:8].upper()
        return f"{prefix}-{hash_val}"

    def process_application(
        self,
        application_id: str,
        validations: List[Dict[str, Any]],
        policies: List[Dict[str, Any]]
    ) -> ApplicationOperationalSummary:
        
        deficiencies = []
        exceptions = []
        created_at = datetime.now(timezone.utc).isoformat()

        # Process Validations
        for val in validations:
            if val.get("status") == "FAIL":
                cls = classify_validation_finding(val)
                action = get_action_guidance(cls["category"], cls["deficiency_type"])
                
                def_id = self._generate_id("DEF", application_id, val.get("validation_type", ""))
                
                # Check for duplicate-like explicit flagging
                if "duplicate" in val.get("reason", "").lower():
                    cls["deficiency_type"] = DeficiencyType.DUPLICATE_LIKE
                    cls["category"] = DeficiencyCategory.DUPLICATE
                    action = get_action_guidance(cls["category"], cls["deficiency_type"])

                record = DeficiencyRecord(
                    deficiency_id=def_id,
                    application_id=application_id,
                    category=cls["category"],
                    deficiency_type=cls["deficiency_type"],
                    severity=cls["severity"],
                    responsible_party=cls["responsible_party"],
                    message=action.message,
                    action_required=action.action_required,
                    correction_guidance=action.correction_guidance,
                    rerun_scope=cls["rerun_scope"],
                    source_type="VALIDATION",
                    source_id=val.get("validation_type", ""),
                    evidence_reference=val.get("evidence", []),
                    created_at=created_at
                )
                deficiencies.append(record)

        # Process Policies
        for pol in policies:
            status = pol.get("status")
            rule_id = pol.get("rule_id", "")
            
            is_deficiency = (status == "FAIL") or (status == "MANUAL_REVIEW_REQUIRED" and "DOC" in rule_id)
            
            if is_deficiency:
                cls = classify_policy_finding(pol)
                action = get_action_guidance(cls["category"], cls["deficiency_type"])
                
                def_id = self._generate_id("DEF", application_id, pol.get("rule_id", ""))
                
                record = DeficiencyRecord(
                    deficiency_id=def_id,
                    application_id=application_id,
                    category=cls["category"],
                    deficiency_type=cls["deficiency_type"],
                    severity=cls["severity"],
                    responsible_party=cls["responsible_party"],
                    message=action.message,
                    action_required=action.action_required,
                    correction_guidance=action.correction_guidance,
                    rerun_scope=cls["rerun_scope"],
                    source_type="POLICY",
                    source_id=pol.get("rule_id", ""),
                    rule_id=pol.get("rule_id", ""),
                    policy_version=pol.get("policy_version", "PM-2022"),
                    evidence_reference=[pol.get("source_reference", {})],
                    created_at=created_at
                )
                deficiencies.append(record)
            
            # Exceptions
            exc_cls = classify_exception(pol)
            if exc_cls:
                exc_id = self._generate_id("EXC", application_id, pol.get("rule_id", ""))
                record = ExceptionRecord(
                    exception_id=exc_id,
                    application_id=application_id,
                    exception_type=exc_cls["exception_type"],
                    reason=pol.get("reason", ""),
                    policy_rule=pol.get("rule_id"),
                    policy_version=pol.get("policy_version", "PM-2022"),
                    required_manual_action=exc_cls["required_manual_action"],
                    responsible_party=exc_cls["responsible_party"],
                    evidence_reference=[pol.get("source_reference", {})],
                    created_at=created_at
                )
                exceptions.append(record)

        # Determine Application Status
        blocking = sum(1 for d in deficiencies if d.severity == Severity.BLOCKING)
        high = sum(1 for d in deficiencies if d.severity == Severity.HIGH)
        medium = sum(1 for d in deficiencies if d.severity == Severity.MEDIUM)
        low = sum(1 for d in deficiencies if d.severity == Severity.LOW)
        manual = len(exceptions)
        
        status = OperationalStatus.NO_DEFICIENCY
        if blocking > 0 or high > 0:
            status = OperationalStatus.ACTION_REQUIRED
        elif manual > 0:
            status = OperationalStatus.MANUAL_REVIEW_REQUIRED
        elif medium > 0 or low > 0:
            status = OperationalStatus.CORRECTION_REQUIRED
            
        # Refine status based on specific deficiency types if needed
        # Just ensure we never output APPROVED or REJECTED.

        return ApplicationOperationalSummary(
            application_id=application_id,
            operational_status=status,
            total_deficiencies=len(deficiencies),
            blocking_count=blocking,
            high_count=high,
            medium_count=medium,
            low_count=low,
            manual_review_count=manual,
            deficiencies=deficiencies,
            exceptions=exceptions
        )
