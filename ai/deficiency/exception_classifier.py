from typing import Dict, Any, Optional
from .schemas import ExceptionType, ResponsibleParty

def classify_exception(policy: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    status = policy.get("status")
    if status != "MANUAL_REVIEW_REQUIRED" and status != "NOT_APPLICABLE":
        return None
        
    rule_id = policy.get("rule_id", "")
    reason = policy.get("reason", "")
    
    exc_type = ExceptionType.POLICY_EXCEPTION
    party = ResponsibleParty.MANUAL_REVIEW
    action = "Manual review required by authorized officer."
    
    if "fee fixation" in reason.lower() or "val-" in rule_id.lower():
        exc_type = ExceptionType.STATE_DEPENDENCY
        party = ResponsibleParty.STATE_OFFICER
        action = "Determine applicable state fee structure."
    elif "orphan" in reason.lower():
        exc_type = ExceptionType.POLICY_EXCEPTION
        action = "Verify orphan status and grant income exception."
    elif "registry" in reason.lower() or "unverified" in reason.lower():
        exc_type = ExceptionType.REFERENCE_DATA_DEPENDENCY
        party = ResponsibleParty.SYSTEM
        action = "Verify against central registry when available."
    elif "ambiguity" in reason.lower() or "ambiguous" in reason.lower():
        exc_type = ExceptionType.MANUAL_VERIFICATION
        party = ResponsibleParty.MANUAL_REVIEW
        action = "Clarify policy applicability with applicant."

    # NOT_APPLICABLE only becomes an exception if it was explicitly flagged as a manual review exception condition upstream
    # In standard execution, NOT_APPLICABLE is ignored, but if the upstream explicitly sets MANUAL_REVIEW_REQUIRED it is an exception.
    if status == "NOT_APPLICABLE":
        # Only treat NOT_APPLICABLE as exception if the reason explicitly points to a state/reference dependency that we know about
        # Based on user instruction: "NOT_APPLICABLE MUST NOT automatically become an exception."
        if "depend" not in reason.lower() and "exception" not in reason.lower():
            return None
        # if it does, it's info only
        party = ResponsibleParty.SYSTEM
        action = "Informational boundary condition."
        
    return {
        "exception_type": exc_type,
        "responsible_party": party,
        "required_manual_action": action
    }
