import pytest
from ai.evidence.engine import EvidenceEngine

def test_clean_application():
    engine = EvidenceEngine()
    chains = engine.process_application("APP-001", [], [], [], [])
    assert len(chains) == 0

def test_missing_document_evidence():
    engine = EvidenceEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-DOC-001", "expected_condition": "Document requirements", "actual_value": "NOT_PRESENT"}]
    defs = [{"deficiency_type": "MISSING_DOCUMENT", "source_type": "POLICY", "source_id": "PM-DOC-001"}]
    
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert len(chains) == 1
    chain = chains[0]
    
    assert chain.finding_type == "MISSING_DOCUMENT"
    assert chain.evidence[0].observed_value == "NOT_PRESENT"
    assert "Required document is missing" in chain.explanation.short_reason

def test_name_mismatch_multi_document_evidence():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", 
        "validation_type": "NAME_CONSISTENCY",
        "reason": "Normalized values do not match.",
        "values": [
            {"document_id": "DOC-1", "raw_value": "ABC", "normalized_value": "abc", "document_type": "ST_CERTIFICATE"},
            {"document_id": "DOC-2", "raw_value": "ABD", "normalized_value": "abd", "document_type": "MARKSHEET"}
        ],
        "evidence": [
            {"document_id": "DOC-1", "field": "Applicant Name"},
            {"document_id": "DOC-2", "field": "Student Name"}
        ]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "NAME_CONSISTENCY"}]
    
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert len(chains) == 1
    chain = chains[0]
    
    assert len(chain.evidence) == 2
    assert chain.evidence[0].evidence_location.document_id == "DOC-1"
    assert chain.evidence[1].evidence_location.document_id == "DOC-2"
    assert "differs across submitted documents" in chain.explanation.short_reason

def test_income_threshold_finding():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-INC-001", "expected_condition": "250000", "actual_value": "300000"}]
    defs = [{"deficiency_type": "THRESHOLD_FAILURE", "source_type": "POLICY", "source_id": "PM-INC-001"}]
    
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert len(chains) == 1
    chain = chains[0]
    
    assert chain.evidence[0].expected_value == "250000"
    assert chain.evidence[0].observed_value == "300000"
    assert "Eligibility condition not met" in chain.explanation.short_reason

def test_policy_manual_review_case():
    engine = EvidenceEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-VAL-001", "reason": "Requires state fee fixing"}]
    excs = [{"exception_type": "STATE_DEPENDENCY", "policy_rule": "PM-VAL-001", "reason": "Requires state fee fixing"}]
    
    chains = engine.process_application("APP-001", [], policies, [], excs)
    assert len(chains) == 1
    chain = chains[0]
    
    assert chain.finding_type == "STATE_DEPENDENCY"
    assert chain.result == "MANUAL_REVIEW_REQUIRED"
    assert "Manual review required" in chain.explanation.short_reason

def test_evidence_id_uniqueness():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", 
        "validation_type": "DOB_CONSISTENCY",
        "values": [{"document_id": "DOC-1", "raw_value": "01/01/2000", "normalized_value": "2000-01-01"}],
        "evidence": [{"document_id": "DOC-1", "field": "DOB"}]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "DOB_CONSISTENCY"}]
    
    chains = engine.process_application("APP-001", vals, [], defs, [])
    ev_id_1 = chains[0].evidence[0].evidence_id
    
    chains2 = engine.process_application("APP-002", vals, [], defs, [])
    ev_id_2 = chains2[0].evidence[0].evidence_id
    
    # IDs should be different for different apps even with same underlying doc IDs in this test
    assert ev_id_1 != ev_id_2

def test_policy_version_linkage():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-INC-001", "policy_version": "PM-2022_V2"}]
    defs = [{"deficiency_type": "THRESHOLD_FAILURE", "source_type": "POLICY", "source_id": "PM-INC-001"}]
    
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert chains[0].rule.policy_version == "PM-2022_V2"

def test_not_available_confidence():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", 
        "validation_type": "DOB_CONSISTENCY",
        "values": [{"document_id": "DOC-1"}],
        "evidence": [{"document_id": "DOC-1", "field": "DOB"}]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "DOB_CONSISTENCY"}]
    
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert chains[0].evidence[0].extraction_confidence == "NOT_AVAILABLE"

def test_deterministic_explanation():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-DOC-001", "expected_condition": "Req", "actual_value": "NOT_PRESENT"}]
    defs = [{"deficiency_type": "MISSING_DOCUMENT", "source_type": "POLICY", "source_id": "PM-DOC-001"}]
    
    chain1 = engine.process_application("APP-001", [], policies, defs, [])[0]
    chain2 = engine.process_application("APP-001", [], policies, defs, [])[0]
    
    assert chain1.explanation.detailed_reason == chain2.explanation.detailed_reason
    assert chain1.finding_id == chain2.finding_id

def test_missing_evidence_reference():
    engine = EvidenceEngine()
    defs = [{"deficiency_type": "UNKNOWN_ERROR", "source_type": "UNKNOWN", "source_id": "NA"}]
    chains = engine.process_application("APP-001", [], [], defs, [])
    assert len(chains) == 1
    assert len(chains[0].evidence) == 0
    assert "Verification finding" in chains[0].explanation.short_reason

def test_missing_document_no_doc_id_fabricated():
    engine = EvidenceEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-DOC-002", "expected_condition": "Req", "actual_value": "NOT_PRESENT"}]
    defs = [{"deficiency_type": "MISSING_DOCUMENT", "source_type": "POLICY", "source_id": "PM-DOC-002"}]
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert chains[0].evidence[0].evidence_location is None

def test_multiple_deficiencies():
    engine = EvidenceEngine()
    policies = [
        {"status": "FAIL", "rule_id": "PM-INC-001", "expected_condition": "250000", "actual_value": "300000"},
        {"status": "FAIL", "rule_id": "PM-CAT-001", "expected_condition": "ST", "actual_value": "SC"}
    ]
    defs = [
        {"deficiency_type": "THRESHOLD_FAILURE", "source_type": "POLICY", "source_id": "PM-INC-001"},
        {"deficiency_type": "THRESHOLD_FAILURE", "source_type": "POLICY", "source_id": "PM-CAT-001"}
    ]
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert len(chains) == 2

def test_category_mismatch():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", "validation_type": "CAT_CONSISTENCY",
        "values": [{"document_id": "DOC-1", "raw_value": "ST"}],
        "evidence": [{"document_id": "DOC-1", "field": "Category"}]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "CAT_CONSISTENCY"}]
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert chains[0].finding_type == "FIELD_MISMATCH"
    assert "Category" in chains[0].explanation.short_reason

def test_institution_mismatch():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", "validation_type": "INST_CONSISTENCY",
        "values": [{"document_id": "DOC-1", "raw_value": "XYZ College"}],
        "evidence": [{"document_id": "DOC-1", "field": "Institution"}]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "INST_CONSISTENCY"}]
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert chains[0].finding_type == "FIELD_MISMATCH"

def test_course_mismatch():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", "validation_type": "COURSE_CONSISTENCY",
        "values": [{"document_id": "DOC-1", "raw_value": "BA History"}],
        "evidence": [{"document_id": "DOC-1", "field": "Course"}]
    }]
    defs = [{"deficiency_type": "FIELD_MISMATCH", "source_type": "VALIDATION", "source_id": "COURSE_CONSISTENCY"}]
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert chains[0].finding_type == "FIELD_MISMATCH"

def test_exception_evidence_manual():
    engine = EvidenceEngine()
    policies = [{"status": "MANUAL_REVIEW_REQUIRED", "rule_id": "PM-EXC-001", "reason": "Requires review"}]
    excs = [{"exception_type": "MANUAL_VERIFICATION", "policy_rule": "PM-EXC-001", "reason": "Requires review"}]
    chains = engine.process_application("APP-001", [], policies, [], excs)
    assert chains[0].result == "MANUAL_REVIEW_REQUIRED"

def test_nonexistent_document_reference():
    engine = EvidenceEngine()
    vals = [{
        "status": "FAIL", "validation_type": "VAL",
        "values": [], # No matching document_id in values
        "evidence": [{"document_id": "DOC-MISSING", "field": "Field"}]
    }]
    defs = [{"deficiency_type": "MISMATCH", "source_type": "VALIDATION", "source_id": "VAL"}]
    chains = engine.process_application("APP-001", vals, [], defs, [])
    assert chains[0].evidence[0].observed_value == "NOT_AVAILABLE"

def test_nonexistent_rule_reference():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-FAKE", "expected_condition": "Req"}]
    defs = [{"deficiency_type": "FAIL", "source_type": "POLICY", "source_id": "PM-FAKE"}]
    chains = engine.process_application("APP-001", [], policies, defs, [])
    assert chains[0].evidence[0].expected_value == "Req"

def test_nonexistent_application_reference():
    engine = EvidenceEngine()
    chains = engine.process_application("APP-INVALID", [], [], [], [])
    assert len(chains) == 0

def test_immutable_verification_run_behavior():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-1", "expected_condition": "A"}]
    defs = [{"deficiency_type": "FAIL", "source_type": "POLICY", "source_id": "PM-1"}]
    chain = engine.process_application("APP-001", [], policies, defs, [])[0]
    # Should not include state modifying methods
    assert hasattr(chain, "created_at")
    assert chain.evidence[0].verification_run_id == "NOT_AVAILABLE"

def test_rule_linkage_default_version():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-1", "expected_condition": "A"}]
    defs = [{"deficiency_type": "FAIL", "source_type": "POLICY", "source_id": "PM-1"}]
    chain = engine.process_application("APP-001", [], policies, defs, [])[0]
    assert chain.rule.policy_version == "PM-2022"

def test_extraction_method_default():
    engine = EvidenceEngine()
    policies = [{"status": "FAIL", "rule_id": "PM-1", "expected_condition": "A"}]
    defs = [{"deficiency_type": "FAIL", "source_type": "POLICY", "source_id": "PM-1"}]
    chain = engine.process_application("APP-001", [], policies, defs, [])[0]
    assert chain.evidence[0].extraction_method == "DIRECT_TEXT"
