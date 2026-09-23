from typing import List, Dict, Any, Optional
from .schemas import StructuredExplanation, EvidenceRecord

def build_explanation(finding_type: str, result: str, evidence: List[EvidenceRecord], policy_reason: Optional[str] = None) -> StructuredExplanation:
    if "MISSING_DOCUMENT" in finding_type or "DOC" in finding_type:
        return StructuredExplanation(
            short_reason="Required document is missing.",
            detailed_reason=f"The application document inventory lacks the required document evidence. {policy_reason if policy_reason else ''}".strip(),
            action_guidance="Upload the required document."
        )
    
    if "MISMATCH" in finding_type or "CONSISTENCY" in finding_type:
        fields = set(e.evidence_location.field for e in evidence if e.evidence_location)
        field_str = ", ".join(fields) if fields else "field"
        
        return StructuredExplanation(
            short_reason=f"{field_str} differs across submitted documents.",
            detailed_reason=f"The normalized extracted values for {field_str} do not match across the provided evidence documents.",
            action_guidance="Review the discrepancy and provide the appropriate correction or supporting clarification."
        )
        
    if "THRESHOLD" in finding_type or "INC" in finding_type or "CAT" in finding_type:
        expected = evidence[0].expected_value if evidence else "configured threshold"
        observed = evidence[0].observed_value if evidence else "submitted value"
        return StructuredExplanation(
            short_reason="Eligibility condition not met.",
            detailed_reason=f"The observed value ({observed}) does not meet the expected condition ({expected}). {policy_reason if policy_reason else ''}".strip(),
            action_guidance="Review the eligibility criteria and correct the application if valid."
        )
        
    if "EXCEPTION" in finding_type or "MANUAL_REVIEW" in result:
        return StructuredExplanation(
            short_reason="Manual review required.",
            detailed_reason=f"An exception condition was met: {policy_reason if policy_reason else 'Ambiguous condition requires manual verification.'}",
            action_guidance="Verify the condition manually according to operating procedures."
        )

    # Fallback
    return StructuredExplanation(
        short_reason="Verification finding.",
        detailed_reason=f"A finding was recorded during verification. {policy_reason if policy_reason else ''}".strip(),
        action_guidance="Review finding."
    )
