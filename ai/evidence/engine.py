from typing import List, Dict, Any
from datetime import datetime, timezone
import hashlib

from .schemas import ExplanationChain, EvidenceRecord, RuleReference, StructuredExplanation
from .evidence_builder import build_validation_evidence, build_policy_evidence, build_rule_reference
from .explanation_builder import build_explanation

class EvidenceEngine:
    def __init__(self):
        pass

    def _generate_explanation_id(self, app_id: str, source_id: str) -> str:
        hash_val = hashlib.sha256(f"{app_id}_{source_id}".encode()).hexdigest()[:8].upper()
        return f"EXP-{hash_val}"

    def process_application(
        self,
        application_id: str,
        validations: List[Dict[str, Any]],
        policies: List[Dict[str, Any]],
        deficiencies: List[Dict[str, Any]],
        exceptions: List[Dict[str, Any]]
    ) -> List[ExplanationChain]:
        
        chains = []
        created_at = datetime.now(timezone.utc).isoformat()
        
        # 1. Map validations
        val_map = {v.get("validation_type"): v for v in validations if v.get("status") == "FAIL"}
        
        # 2. Map policies
        pol_map = {p.get("rule_id"): p for p in policies if p.get("status") in ["FAIL", "MANUAL_REVIEW_REQUIRED"]}

        # 3. Build chains for each Deficiency
        for def_record in deficiencies:
            source_id = def_record.get("source_id", "")
            source_type = def_record.get("source_type", "")
            def_type = def_record.get("deficiency_type", "")
            
            evidence_records = []
            rule_ref = None
            policy_reason = None
            
            if source_type == "VALIDATION":
                val = val_map.get(source_id)
                if val:
                    evidence_records = build_validation_evidence(application_id, val, created_at)
                    policy_reason = val.get("reason")
                    rule_ref = RuleReference(rule_id=source_id, rule_statement="Cross-document consistency rule")
            elif source_type == "POLICY":
                pol = pol_map.get(source_id)
                if pol:
                    evidence_records = build_policy_evidence(application_id, pol, created_at)
                    rule_ref = build_rule_reference(pol)
                    policy_reason = pol.get("reason")
            
            explanation = build_explanation(def_type, "FAIL", evidence_records, policy_reason)
            
            exp_id = self._generate_explanation_id(application_id, source_id)
            chain = ExplanationChain(
                finding_id=exp_id,
                application_id=application_id,
                finding_type=def_type,
                result="FAIL",
                rule=rule_ref,
                evidence=evidence_records,
                explanation=explanation,
                created_at=created_at
            )
            chains.append(chain)
            
        # 4. Build chains for each Exception
        for exc_record in exceptions:
            rule_id = exc_record.get("policy_rule", "")
            exc_type = exc_record.get("exception_type", "")
            
            evidence_records = []
            rule_ref = None
            policy_reason = exc_record.get("reason")
            
            pol = pol_map.get(rule_id)
            if pol:
                evidence_records = build_policy_evidence(application_id, pol, created_at)
                rule_ref = build_rule_reference(pol)
                
            explanation = build_explanation(exc_type, "MANUAL_REVIEW_REQUIRED", evidence_records, policy_reason)
            
            exp_id = self._generate_explanation_id(application_id, rule_id)
            chain = ExplanationChain(
                finding_id=exp_id,
                application_id=application_id,
                finding_type=exc_type,
                result="MANUAL_REVIEW_REQUIRED",
                rule=rule_ref,
                evidence=evidence_records,
                explanation=explanation,
                created_at=created_at
            )
            chains.append(chain)
            
        return chains
