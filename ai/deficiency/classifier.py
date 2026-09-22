from typing import Dict, Any, Optional
from .schemas import DeficiencyCategory, DeficiencyType, Severity, ResponsibleParty, RerunScope

def classify_validation_finding(validation: Dict[str, Any]) -> Dict[str, Any]:
    val_type = validation.get("validation_type", "")
    field = validation.get("field", "")
    
    # Defaults
    category = DeficiencyCategory.DOCUMENT
    def_type = DeficiencyType.FIELD_MISMATCH
    severity = Severity.HIGH
    party = ResponsibleParty.APPLICANT
    rerun = RerunScope.ALL

    if val_type == "NAME_CONSISTENCY":
        category = DeficiencyCategory.IDENTITY
        def_type = DeficiencyType.FIELD_MISMATCH
        rerun = RerunScope.IDENTITY_VALIDATION
        severity = Severity.HIGH
    elif val_type == "DOB_CONSISTENCY":
        category = DeficiencyCategory.DATE_OF_BIRTH
        def_type = DeficiencyType.FIELD_MISMATCH
        rerun = RerunScope.DOB_VALIDATION
        severity = Severity.HIGH
    elif val_type == "CATEGORY_CONSISTENCY":
        category = DeficiencyCategory.CATEGORY
        def_type = DeficiencyType.FIELD_MISMATCH
        rerun = RerunScope.CATEGORY_VALIDATION
        severity = Severity.BLOCKING
    elif val_type == "INCOME_CONSISTENCY":
        category = DeficiencyCategory.INCOME
        def_type = DeficiencyType.VALUE_CONFLICT
        rerun = RerunScope.INCOME_POLICY_CHECK
        severity = Severity.BLOCKING
    elif val_type == "INSTITUTION_CONSISTENCY":
        category = DeficiencyCategory.INSTITUTION
        def_type = DeficiencyType.FIELD_MISMATCH
        party = ResponsibleParty.INSTITUTION
        rerun = RerunScope.INSTITUTION_VALIDATION
        severity = Severity.BLOCKING
    elif val_type == "COURSE_CONSISTENCY":
        category = DeficiencyCategory.COURSE
        def_type = DeficiencyType.FIELD_MISMATCH
        party = ResponsibleParty.INSTITUTION
        rerun = RerunScope.COURSE_VALIDATION
        severity = Severity.BLOCKING
    elif val_type == "DOMICILE_CONSISTENCY":
        category = DeficiencyCategory.DOMICILE
        def_type = DeficiencyType.FIELD_MISMATCH
        rerun = RerunScope.DOMICILE_VALIDATION
        severity = Severity.HIGH

    return {
        "category": category,
        "deficiency_type": def_type,
        "severity": severity,
        "responsible_party": party,
        "rerun_scope": rerun
    }

def classify_policy_finding(policy: Dict[str, Any]) -> Dict[str, Any]:
    rule_id = policy.get("rule_id", "")
    
    category = DeficiencyCategory.SYSTEM
    def_type = DeficiencyType.THRESHOLD_FAILURE
    severity = Severity.HIGH
    party = ResponsibleParty.APPLICANT
    rerun = RerunScope.ALL
    
    if "DOC" in rule_id:
        category = DeficiencyCategory.DOCUMENT
        def_type = DeficiencyType.MISSING_DOCUMENT
        severity = Severity.BLOCKING
        rerun = RerunScope.REQUIRED_DOCUMENT_CHECK
    elif "INC" in rule_id:
        category = DeficiencyCategory.INCOME
        def_type = DeficiencyType.THRESHOLD_FAILURE
        severity = Severity.BLOCKING
        rerun = RerunScope.INCOME_POLICY_CHECK
    elif "CAT" in rule_id:
        category = DeficiencyCategory.CATEGORY
        def_type = DeficiencyType.THRESHOLD_FAILURE
        severity = Severity.BLOCKING
        rerun = RerunScope.CATEGORY_VALIDATION
    elif "REN" in rule_id:
        category = DeficiencyCategory.RENEWAL
        def_type = DeficiencyType.RENEWAL_CHECK
        severity = Severity.HIGH
        party = ResponsibleParty.STATE_OFFICER
        rerun = RerunScope.NONE
    elif "OTH" in rule_id or "SCHOLARSHIP" in rule_id:
        category = DeficiencyCategory.OTHER_SCHOLARSHIP
        def_type = DeficiencyType.OTHER_SCHOLARSHIP_CONFLICT
        severity = Severity.BLOCKING
        rerun = RerunScope.ALL
        
    return {
        "category": category,
        "deficiency_type": def_type,
        "severity": severity,
        "responsible_party": party,
        "rerun_scope": rerun
    }
