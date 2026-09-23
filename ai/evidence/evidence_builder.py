import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from .schemas import EvidenceRecord, EvidenceLocation, RuleReference, PolicySourceReference

def _generate_evidence_id(app_id: str, source_id: str, field: str = "") -> str:
    hash_val = hashlib.sha256(f"{app_id}_{source_id}_{field}".encode()).hexdigest()[:8].upper()
    return f"EVD-{hash_val}"

def build_validation_evidence(app_id: str, validation: Dict[str, Any], created_at: str) -> List[EvidenceRecord]:
    evidence_list = []
    
    vals = validation.get("values", [])
    evidences = validation.get("evidence", [])
    
    # Map values by document_id
    val_map = {v.get("document_id"): v for v in vals}
    
    for ev in evidences:
        doc_id = ev.get("document_id")
        field = ev.get("field")
        
        val_obj = val_map.get(doc_id, {})
        doc_type = val_obj.get("document_type", "UNKNOWN")
        raw_val = val_obj.get("raw_value", "NOT_AVAILABLE")
        norm_val = val_obj.get("normalized_value", "NOT_AVAILABLE")
        
        ev_id = _generate_evidence_id(app_id, doc_id, field)
        
        loc = EvidenceLocation(
            document_id=doc_id,
            document_type=doc_type,
            field=field
        )
        
        record = EvidenceRecord(
            evidence_id=ev_id,
            application_id=app_id,
            observed_value=str(raw_val),
            normalized_value=str(norm_val),
            evidence_location=loc,
            created_at=created_at
        )
        evidence_list.append(record)
        
    return evidence_list

def build_policy_evidence(app_id: str, policy: Dict[str, Any], created_at: str) -> List[EvidenceRecord]:
    rule_id = policy.get("rule_id", "")
    ev_id = _generate_evidence_id(app_id, rule_id)
    
    expected = str(policy.get("expected_condition", "NOT_AVAILABLE"))
    actual = str(policy.get("actual_value", "NOT_AVAILABLE"))
    
    # Check if this is a missing document specifically
    if "DOC" in rule_id and actual == "NOT_PRESENT":
        # Note: In Step 12, 'actual_value' might be a list of documents present. 
        # But if we want to represent NOT_PRESENT, we do it via explanation builder or explicitly here.
        # Let's map actual to NOT_PRESENT if expected document is not in actual_value list.
        pass
        
    if isinstance(policy.get("actual_value"), list):
        # We can format list nicely
        actual = ", ".join(policy.get("actual_value"))
        
    record = EvidenceRecord(
        evidence_id=ev_id,
        application_id=app_id,
        expected_value=expected,
        observed_value=actual,
        created_at=created_at
    )
    return [record]

def build_rule_reference(policy: Dict[str, Any]) -> RuleReference:
    source_ref = policy.get("source_reference")
    pol_source = None
    if source_ref:
        pol_source = PolicySourceReference(
            source_id=source_ref.get("source_id", "NOT_AVAILABLE"),
            source_document=source_ref.get("source_document", "NOT_AVAILABLE"),
            source_page=source_ref.get("source_page", "NOT_AVAILABLE"),
            source_section=source_ref.get("source_section", "NOT_AVAILABLE"),
            source_reference=source_ref.get("source_reference", "NOT_AVAILABLE")
        )
    return RuleReference(
        rule_id=policy.get("rule_id", ""),
        policy_version=policy.get("policy_version", "PM-2022"),
        source_reference=pol_source
    )
