import pytest
from ai.deficiency.engine import DeficiencyEngine
from ai.deficiency.schemas import (
    DeficiencyCategory, DeficiencyType, Severity, ResponsibleParty, RerunScope,
    ExceptionType, OperationalStatus
)

def test_clean_application():
    engine = DeficiencyEngine()
    summary = engine.process_application("APP-001", [], [])
    assert summary.operational_status == OperationalStatus.NO_DEFICIENCY
    assert summary.total_deficiencies == 0
    assert len(summary.exceptions) == 0

def test_missing_document():
    engine = DeficiencyEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-DOC-001"}]
    summary = engine.process_application("APP-001", [], policies)
    
    assert summary.operational_status == OperationalStatus.ACTION_REQUIRED
    assert summary.total_deficiencies == 1
    assert summary.blocking_count == 1
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.DOCUMENT
    assert d.deficiency_type == DeficiencyType.MISSING_DOCUMENT
    assert d.severity == Severity.BLOCKING
    assert d.rerun_scope == RerunScope.REQUIRED_DOCUMENT_CHECK

def test_name_mismatch():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "NAME_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    assert summary.operational_status == OperationalStatus.ACTION_REQUIRED
    assert summary.high_count == 1
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.IDENTITY
    assert d.deficiency_type == DeficiencyType.FIELD_MISMATCH
    assert d.severity == Severity.HIGH
    assert d.rerun_scope == RerunScope.IDENTITY_VALIDATION

def test_dob_mismatch():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "DOB_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.DATE_OF_BIRTH
    assert d.deficiency_type == DeficiencyType.FIELD_MISMATCH
    assert d.severity == Severity.HIGH
    assert d.rerun_scope == RerunScope.DOB_VALIDATION

def test_category_mismatch():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "CATEGORY_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.CATEGORY
    assert d.severity == Severity.BLOCKING

def test_income_above_threshold():
    engine = DeficiencyEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-INC-001"}]
    summary = engine.process_application("APP-001", [], policies)
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.INCOME
    assert d.deficiency_type == DeficiencyType.THRESHOLD_FAILURE
    assert d.severity == Severity.BLOCKING

def test_multiple_income_sources():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "INCOME_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.INCOME
    assert d.deficiency_type == DeficiencyType.VALUE_CONFLICT
    assert d.severity == Severity.BLOCKING
    assert d.rerun_scope == RerunScope.INCOME_POLICY_CHECK

def test_orphan_income_exception():
    engine = DeficiencyEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-INC-002", "reason": "Orphan status exception"}]
    summary = engine.process_application("APP-001", [], policies)
    
    assert summary.operational_status == OperationalStatus.MANUAL_REVIEW_REQUIRED
    assert summary.manual_review_count == 1
    
    e = summary.exceptions[0]
    assert e.exception_type == ExceptionType.POLICY_EXCEPTION
    assert e.responsible_party == ResponsibleParty.MANUAL_REVIEW

def test_renewal_case():
    engine = DeficiencyEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-REN-001"}]
    summary = engine.process_application("APP-001", [], policies)
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.RENEWAL
    assert d.severity == Severity.HIGH

def test_duplicate_like_case():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "DUPLICATE_CHECK", "reason": "Potential duplicate record"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.DUPLICATE
    assert d.deficiency_type == DeficiencyType.DUPLICATE_LIKE

def test_ambiguous_policy_case():
    engine = DeficiencyEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "reason": "Ambiguous certificate wording"}]
    summary = engine.process_application("APP-001", [], policies)
    
    e = summary.exceptions[0]
    assert e.exception_type == ExceptionType.MANUAL_VERIFICATION

def test_state_dependency():
    engine = DeficiencyEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-VAL-001", "reason": "Depends on state fee fixation"}]
    summary = engine.process_application("APP-001", [], policies)
    
    e = summary.exceptions[0]
    assert e.exception_type == ExceptionType.STATE_DEPENDENCY
    assert e.responsible_party == ResponsibleParty.STATE_OFFICER

def test_institution_dependency():
    engine = DeficiencyEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "reason": "Institution registry unavailable"}]
    summary = engine.process_application("APP-001", [], policies)
    
    e = summary.exceptions[0]
    assert e.exception_type == ExceptionType.REFERENCE_DATA_DEPENDENCY
    assert e.responsible_party == ResponsibleParty.SYSTEM

def test_multiple_deficiencies():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "NAME_CONSISTENCY"}]
    policies = [{"status": "FAIL", "rule_id": "PM-DOC-001"}]
    summary = engine.process_application("APP-001", validations, policies)
    
    assert summary.total_deficiencies == 2
    assert summary.blocking_count == 1
    assert summary.high_count == 1
    assert summary.operational_status == OperationalStatus.ACTION_REQUIRED

def test_multiple_deficiencies_different_severities():
    engine = DeficiencyEngine()
    validations = [
        {"status": "FAIL", "validation_type": "NAME_CONSISTENCY"},
        {"status": "FAIL", "validation_type": "CATEGORY_CONSISTENCY"}
    ]
    summary = engine.process_application("APP-001", validations, [])
    
    assert summary.total_deficiencies == 2
    assert summary.blocking_count == 1
    assert summary.high_count == 1

def test_manual_review_routing():
    engine = DeficiencyEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "reason": "Ambiguous policy"}]
    summary = engine.process_application("APP-001", [], policies)
    
    assert summary.operational_status == OperationalStatus.MANUAL_REVIEW_REQUIRED

def test_rerun_scope():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "DOMICILE_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.rerun_scope == RerunScope.DOMICILE_VALIDATION

def test_responsible_party_mapping():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "COURSE_CONSISTENCY"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.responsible_party == ResponsibleParty.INSTITUTION

def test_unsupported_finding_handling():
    engine = DeficiencyEngine()
    validations = [{"status": "FAIL", "validation_type": "UNKNOWN_CHECK"}]
    summary = engine.process_application("APP-001", validations, [])
    
    d = summary.deficiencies[0]
    assert d.category == DeficiencyCategory.DOCUMENT
    assert d.deficiency_type == DeficiencyType.FIELD_MISMATCH
    assert d.severity == Severity.HIGH

def test_deterministic_repeatability():
    engine = DeficiencyEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-DOC-001"}]
    summary1 = engine.process_application("APP-001", [], policies)
    summary2 = engine.process_application("APP-001", [], policies)
    
    assert summary1.deficiencies[0].deficiency_id == summary2.deficiencies[0].deficiency_id
