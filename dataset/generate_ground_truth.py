import json
import os

INPUT_APPS = "applications/post_matric/applications.json"
INPUT_DOCS = "documents/post_matric/document_manifest.json"
OUTPUT_DIR = "ground_truth/post_matric"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(INPUT_APPS, 'r') as f:
    apps = json.load(f)
with open(INPUT_DOCS, 'r') as f:
    docs = json.load(f)

# 1. applications_ground_truth.json
apps_gt = []
for app in apps:
    expected_class = "VALIDATION_PASS"
    if "AMBIGUOUS_CASE" in app['scenario_tags']:
        expected_class = "MANUAL_REVIEW_REQUIRED"
    elif any(t in app['scenario_tags'] for t in ["MISSING_DOCUMENT", "NAME_MISMATCH", "DOB_MISMATCH", "INCOME_ABOVE_LIMIT", "CATEGORY_ISSUE", "COURSE_ISSUE", "OTHER_SCHOLARSHIP", "MULTIPLE_DEFICIENCIES", "TOP_CLASS_EXCLUSION"]):
        expected_class = "DEFICIENCY_FOUND"
    
    manual_review = app.get("manual_review_expected", False)
    reason = "Central guideline does not establish sufficient information" if manual_review else ""

    apps_gt.append({
        "application_id": app['application_id'],
        "scenario_tags": app['scenario_tags'],
        "policy_version": app['policy_version'],
        "expected_application_class": expected_class,
        "expected_document_presence": [d['document_type'] for d in app['documents_expected']],
        "expected_manual_review": manual_review,
        "expected_review_reason": reason,
        "source_application_fields": app
    })

with open(os.path.join(OUTPUT_DIR, 'applications_ground_truth.json'), 'w') as f:
    json.dump(apps_gt, f, indent=4)

# 2. documents_ground_truth.json
docs_gt = []
for doc in docs:
    expected_field_values = []
    for f in doc.get('expected_fields', []):
        if isinstance(f, dict):
            k = f["field"]
            v = f["value"]
        else:
            k = f
            v = ""
        expected_field_values.append({
            "field_name": k,
            "raw_expected_value": str(v),
            "normalized_expected_value": str(v).upper(),
            "source_of_truth": "synthetic_document"
        })
    docs_gt.append({
        "document_id": doc['document_id'],
        "application_id": doc['application_id'],
        "document_type": doc['document_type'],
        "expected_presence": "PRESENT",
        "expected_quality": doc['quality_label'],
        "expected_fields": [f['field_name'] for f in expected_field_values],
        "expected_field_values": expected_field_values,
        "expected_defects": doc['intentional_defects'],
        "expected_scenario_role": doc['scenario_role']
    })

with open(os.path.join(OUTPUT_DIR, 'documents_ground_truth.json'), 'w') as f:
    json.dump(docs_gt, f, indent=4)

# 3. validation_ground_truth.json
import re
def n_str(x): return re.sub(r'[^\w\s]', '', str(x)).strip().lower()
def n_inc(x): return re.sub(r'\D', '', str(x))

validation_gt = []
for app in apps:
    app_id = app['application_id']
    tags = app['scenario_tags']
    
    app_docs = [d for d in docs_gt if d['application_id'] == app_id]
    
    def check_consistency(field_names, norm_fn):
        vals = []
        for d in app_docs:
            for f in d['expected_field_values']:
                if f['field_name'] in field_names:
                    vals.append(norm_fn(f['raw_expected_value']))
                    break
        if not vals: return "NOT_APPLICABLE"
        if len(set(vals)) == 1: return "PASS"
        if "AMBIGUOUS_CASE" in tags: return "MANUAL_REVIEW_REQUIRED"
        return "FAIL"

    validation_gt.append({
        "application_id": app_id,
        "checks": {
            "NAME_CONSISTENCY": check_consistency(["Applicant Name", "Name", "Student Name", "Applicant"], n_str),
            "DOB_CONSISTENCY": check_consistency(["Date of Birth", "DOB"], n_str),
            "CATEGORY_CONSISTENCY": check_consistency(["Category"], n_str),
            "INCOME_CONSISTENCY": check_consistency(["Annual Family Income"], n_inc),
            "INSTITUTION_CONSISTENCY": check_consistency(["Institution", "University"], n_str),
            "COURSE_CONSISTENCY": check_consistency(["Course / Programme", "Course"], n_str)
        }
    })

with open(os.path.join(OUTPUT_DIR, 'validation_ground_truth.json'), 'w') as f:
    json.dump(validation_gt, f, indent=4)

# 4. policy_ground_truth.json
policy_gt = []
for app in apps:
    app_id = app['application_id']
    is_ambiguous = "AMBIGUOUS_CASE" in app['scenario_tags']
    policy_gt.append({
        "application_id": app_id,
        "policy_version": "PM-2022",
        "applicable_rule_ids": ["PM-ELIG-001", "PM-INC-001", "PM-INST-001"],
        "rule_inputs": {
            "category": app['category']['claimed_category'],
            "family_income_annum": app['income']['family_income_annum']
        },
        "expected_rule_status": "MANUAL_REVIEW_REQUIRED" if is_ambiguous else ("FAIL" if "INCOME_ABOVE_LIMIT" in app['scenario_tags'] or "CATEGORY_ISSUE" in app['scenario_tags'] else "PASS"),
        "manual_review": is_ambiguous,
        "manual_review_reason": "Central guideline does not establish sufficient information" if is_ambiguous else "",
        "policy_source_refs": ["SRC-PM-001"]
    })

with open(os.path.join(OUTPUT_DIR, 'policy_ground_truth.json'), 'w') as f:
    json.dump(policy_gt, f, indent=4)

# 5. deficiency_ground_truth.json
deficiency_gt = []
def_counter = 1
for app in apps:
    app_id = app['application_id']
    tags = app['scenario_tags']
    if "MISSING_DOCUMENT" in tags or "MULTIPLE_DEFICIENCIES" in tags:
        deficiency_gt.append({
            "deficiency_id": f"DEF-{def_counter:04d}",
            "application_id": app_id,
            "deficiency_type": "MISSING_DOCUMENT",
            "severity": "HIGH",
            "description": "Required document is missing",
            "affected_document_ids": [],
            "affected_fields": [],
            "source_rule_ids": ["PM-DOC-001"],
            "expected_action": "REQUEST_CORRECTION",
            "evidence_ids": []
        })
        def_counter += 1

with open(os.path.join(OUTPUT_DIR, 'deficiency_ground_truth.json'), 'w') as f:
    json.dump(deficiency_gt, f, indent=4)

# 6. evidence_ground_truth.json
evidence_gt = []
ev_counter = 1
for doc in docs_gt:
    for f in doc['expected_field_values']:
        evidence_gt.append({
            "finding_id": f"EV-{ev_counter:05d}",
            "application_id": doc['application_id'],
            "finding_type": "FIELD_EXTRACTION",
            "value": f['raw_expected_value'],
            "evidence": {
                "document_id": doc['document_id'],
                "document_type": doc['document_type'],
                "field": f['field_name'],
                "page_or_location": "Page 1"
            },
            "rule": {
                "rule_id": "PM-DOC-001",
                "policy_version": "PM-2022",
                "source_id": "SRC-PM-001",
                "source_page": "12",
                "source_section": "6"
            },
            "reason": "Explicitly declared in generated benchmark document."
        })
        ev_counter += 1

with open(os.path.join(OUTPUT_DIR, 'evidence_ground_truth.json'), 'w') as f:
    json.dump(evidence_gt, f, indent=4)

# 7. verification_runs_ground_truth.json
vr_gt = []
for app in apps:
    app_id = app['application_id']
    expected_action = "no deficiency"
    if "AMBIGUOUS_CASE" in app['scenario_tags']: expected_action = "MANUAL_REVIEW_REQUIRED"
    elif any(t in app['scenario_tags'] for t in ["MISSING_DOCUMENT", "NAME_MISMATCH", "DOB_MISMATCH"]): expected_action = "deficiency -> correction -> re-verification"
    
    vr_gt.append({
        "application_id": app_id,
        "expected_lifecycle": f"INITIAL_SUBMISSION -> verification -> {expected_action}",
        "correction_opportunity_available": "correction" in expected_action
    })

with open(os.path.join(OUTPUT_DIR, 'verification_runs_ground_truth.json'), 'w') as f:
    json.dump(vr_gt, f, indent=4)

print("Generated all Ground Truth JSON files.")
