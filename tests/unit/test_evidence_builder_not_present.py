"""
tests/unit/test_evidence_builder_not_present.py

Unit tests for the NOT_PRESENT evidence handling fix in
ai/evidence/evidence_builder.py (P2-05 fix).
"""
from ai.evidence.evidence_builder import build_policy_evidence


def test_not_present_for_doc_rule():
    """When actual_value is 'NOT_PRESENT' and rule_id contains 'DOC',
    the evidence record must show observed_value == 'NOT_PRESENT'."""
    policy = {
        "rule_id": "PM-DOC-001",
        "expected_condition": "INCOME_CERTIFICATE present",
        "actual_value": "NOT_PRESENT",
    }
    records = build_policy_evidence("APP-001", policy, "2026-01-01T00:00:00")
    assert len(records) == 1
    rec = records[0]
    assert rec.observed_value == "NOT_PRESENT"
    assert "INCOME_CERTIFICATE" in rec.expected_value


def test_not_present_for_doc_rule_none_actual():
    """When actual_value is None for a DOC rule, observed_value should be 'NOT_PRESENT'."""
    policy = {
        "rule_id": "PM-DOC-002",
        "expected_condition": "ST_CERTIFICATE present",
        "actual_value": None,
    }
    records = build_policy_evidence("APP-001", policy, "2026-01-01T00:00:00")
    assert records[0].observed_value == "NOT_PRESENT"


def test_list_actual_value_formatted():
    """When actual_value is a list, it should be comma-joined in observed_value."""
    policy = {
        "rule_id": "PM-ELIG-001",
        "expected_condition": "category in [ST, SC]",
        "actual_value": ["INCOME_CERTIFICATE", "MARKSHEET"],
    }
    records = build_policy_evidence("APP-001", policy, "2026-01-01T00:00:00")
    assert records[0].observed_value == "INCOME_CERTIFICATE, MARKSHEET"


def test_scalar_actual_value():
    """Regular scalar actual_value should be stringified."""
    policy = {
        "rule_id": "PM-INC-001",
        "expected_condition": "annual_income <= 250000",
        "actual_value": 300000,
    }
    records = build_policy_evidence("APP-001", policy, "2026-01-01T00:00:00")
    assert records[0].observed_value == "300000"


def test_missing_actual_value_non_doc_rule():
    """Non-DOC rule with None actual_value should show NOT_AVAILABLE, not NOT_PRESENT."""
    policy = {
        "rule_id": "PM-ELIG-001",
        "expected_condition": "something",
        "actual_value": None,
    }
    records = build_policy_evidence("APP-001", policy, "2026-01-01T00:00:00")
    assert records[0].observed_value == "NOT_AVAILABLE"


def test_evidence_id_deterministic():
    """Evidence IDs should be deterministic for same inputs."""
    policy = {
        "rule_id": "PM-DOC-001",
        "expected_condition": "INCOME_CERTIFICATE present",
        "actual_value": "NOT_PRESENT",
    }
    records1 = build_policy_evidence("APP-ABC", policy, "2026-01-01T00:00:00")
    records2 = build_policy_evidence("APP-ABC", policy, "2026-01-01T00:00:00")
    assert records1[0].evidence_id == records2[0].evidence_id
