import json
import csv
import random

# Fixed seed for reproducibility
random.seed(42)

apps = []
manifest = []

def create_base_app(idx):
    return {
        "application_id": f"APP-{idx:04d}",
        "synthetic_profile_id": f"SYN-ST-{idx:04d}",
        "scheme": "POST_MATRIC",
        "policy_version": "PM-2022",
        "academic_year": "2026-2027",
        "application_type": "NEW_ADMISSION",
        "student": {
            "name": f"Synthetic Student {idx}",
            "dob": f"2005-06-{(idx%28)+1:02d}",
            "gender": random.choice(["M", "F"])
        },
        "category": {
            "claimed_category": "ST",
            "domicile_state": "Odisha"
        },
        "education": {
            "last_qualified_exam": "Higher Secondary",
            "last_qualified_marks_percent": round(random.uniform(55.0, 95.0), 1)
        },
        "institution": {
            "institute_name": "Synthetic Govt Degree College",
            "institute_type": "Government",
            "state": "Odisha"
        },
        "course": {
            "course_name": "B.A. History",
            "group": "Group II"
        },
        "income": {
            "family_income_annum": random.randint(50000, 240000),
            "income_source": "Parents",
            "is_orphan": False,
            "marital_status": "Unmarried"
        },
        "bank": {
            "has_valid_account": True,
            "is_aadhar_linked": True,
            "mobile_linked": True
        },
        "scholarship_status": {
            "receiving_other_scholarship": False,
            "top_class_institute": False
        },
        "documents_expected": [
            {"document_type": "ST_CERTIFICATE", "expected_presence": "REQUIRED"},
            {"document_type": "INCOME_CERTIFICATE", "expected_presence": "REQUIRED"},
            {"document_type": "DOMICILE_CERTIFICATE", "expected_presence": "REQUIRED"},
            {"document_type": "AADHAR", "expected_presence": "REQUIRED"},
            {"document_type": "MARKSHEET", "expected_presence": "REQUIRED"},
            {"document_type": "PASSPORT_PHOTO", "expected_presence": "REQUIRED"}
        ],
        "scenario_tags": [],
        "state_rule_dependency": False,
        "manual_review_expected": False,
        "notes": ""
    }

def add_manifest(app, desc, special="", review=False):
    manifest.append({
        "Application ID": app["application_id"],
        "Scenario tag": ", ".join(app["scenario_tags"]),
        "Short scenario description": desc,
        "Policy version": app["policy_version"],
        "Expected document situation": str([d["document_type"] for d in app["documents_expected"]]),
        "Special conditions": special,
        "Whether later manual review is expected": str(review),
        "Notes": app["notes"]
    })

# 1-20: VALID_BASELINE
for i in range(1, 21):
    app = create_base_app(i)
    app["scenario_tags"].append("VALID_BASELINE")
    app["notes"] = "Clean baseline case."
    apps.append(app)
    add_manifest(app, "Clean baseline case satisfying all rules.")

# 21-30: MISSING_DOCUMENT
for i in range(21, 31):
    app = create_base_app(i)
    app["scenario_tags"].append("MISSING_DOCUMENT")
    doc_to_miss = random.choice(["INCOME_CERTIFICATE", "MARKSHEET", "DOMICILE_CERTIFICATE"])
    app["documents_expected"] = [d for d in app["documents_expected"] if d["document_type"] != doc_to_miss]
    app["notes"] = f"Missing {doc_to_miss}."
    apps.append(app)
    add_manifest(app, f"Applicant failed to upload {doc_to_miss}.")

# 31-40: NAME_MISMATCH
for i in range(31, 41):
    app = create_base_app(i)
    app["scenario_tags"].append("NAME_MISMATCH")
    app["notes"] = "Name in Aadhar differs from Marksheet."
    apps.append(app)
    add_manifest(app, "Name mismatch across documents.")

# 41-45: DOB_MISMATCH
for i in range(41, 46):
    app = create_base_app(i)
    app["scenario_tags"].append("DOB_MISMATCH")
    app["notes"] = "DOB in Aadhar differs from ST certificate."
    apps.append(app)
    add_manifest(app, "Date of birth discrepancy.")

# 46-55: INCOME_ISSUE (10 cases)
for i in range(46, 50):
    app = create_base_app(i)
    app["scenario_tags"].append("INCOME_ABOVE_LIMIT")
    app["income"]["family_income_annum"] = random.randint(260000, 500000)
    app["notes"] = "Income exceeds Rs 2.5 Lakh limit."
    apps.append(app)
    add_manifest(app, "Income exceeds the statutory limit.")
for i in range(50, 52):
    app = create_base_app(i)
    app["scenario_tags"].append("MULTIPLE_INCOME_SOURCE")
    app["notes"] = "Both parents working, combined income within limit."
    apps.append(app)
    add_manifest(app, "Combined income of both parents.")
for i in range(52, 54):
    app = create_base_app(i)
    app["scenario_tags"].append("ORPHAN_INCOME_EXCEPTION")
    app["income"]["is_orphan"] = True
    app["income"]["family_income_annum"] = 0
    app["notes"] = "Orphan supported by guardian, income criteria does not apply."
    apps.append(app)
    add_manifest(app, "Orphan exception for income threshold.")
for i in range(54, 56):
    app = create_base_app(i)
    app["scenario_tags"].append("INCOME_WITHIN_LIMIT")
    app["income"]["family_income_annum"] = 249000
    app["notes"] = "Income very close to the limit but valid."
    apps.append(app)
    add_manifest(app, "Edge case income just below threshold.")

# 56-60: CATEGORY_ISSUE (5 cases)
for i in range(56, 61):
    app = create_base_app(i)
    app["scenario_tags"].append("CATEGORY_ISSUE")
    app["category"]["claimed_category"] = random.choice(["SC", "OBC", "General"])
    app["notes"] = "Not a Scheduled Tribe applicant."
    apps.append(app)
    add_manifest(app, "Applicant does not belong to ST category.")

# 61-70: INSTITUTION/COURSE/TOP_CLASS (10 cases)
for i in range(61, 65):
    app = create_base_app(i)
    app["scenario_tags"].append("TOP_CLASS_EXCLUSION")
    app["scholarship_status"]["top_class_institute"] = True
    app["notes"] = "Studying in a Top Class Institute, excluded from Post-Matric."
    apps.append(app)
    add_manifest(app, "Institute is listed under Top Class scheme.", special="Top Class Exclusion")
for i in range(65, 68):
    app = create_base_app(i)
    app["scenario_tags"].append("COURSE_ISSUE")
    app["notes"] = "Applying for lower degree stream after completing higher degree."
    apps.append(app)
    add_manifest(app, "Invalid progression (e.g. B.Com after BSc).")
for i in range(68, 71):
    app = create_base_app(i)
    app["scenario_tags"].append("OTHER_SCHOLARSHIP")
    app["scholarship_status"]["receiving_other_scholarship"] = True
    app["notes"] = "Receiving another state scholarship."
    apps.append(app)
    add_manifest(app, "Dual scholarship conflict.")

# 71-80: MULTIPLE_DEFICIENCIES (10 cases)
for i in range(71, 81):
    app = create_base_app(i)
    app["scenario_tags"].append("MULTIPLE_DEFICIENCIES")
    app["income"]["family_income_annum"] = 300000
    app["documents_expected"] = [d for d in app["documents_expected"] if d["document_type"] != "ST_CERTIFICATE"]
    app["notes"] = "Income above limit AND missing ST certificate."
    apps.append(app)
    add_manifest(app, "Multiple failures: Income and Document.")

# 81-85: RENEWAL_CASE (5 cases)
for i in range(81, 86):
    app = create_base_app(i)
    app["application_type"] = "RENEWAL"
    app["scenario_tags"].append("RENEWAL_CASE")
    app["documents_expected"] = [d for d in app["documents_expected"] if d["document_type"] != "INCOME_CERTIFICATE"]
    app["notes"] = "Renewal case. Income certificate from 1st year remains valid."
    apps.append(app)
    add_manifest(app, "Valid renewal without new income certificate.", special="Renewal rule applies")

# 86-90: DUPLICATE_LIKE (5 cases)
for i in range(86, 91):
    app = create_base_app(i)
    app["scenario_tags"].append("DUPLICATE_LIKE")
    base_idx = i - 80
    app["student"]["name"] = f"Synthetic Student {base_idx}"
    app["student"]["dob"] = f"2005-06-{(base_idx%28)+1:02d}"
    app["notes"] = f"Similar to APP-{base_idx:04d} but different ID."
    apps.append(app)
    add_manifest(app, "Potential duplicate application.")

# 91-95: AMBIGUOUS_CASE / MANUAL_REVIEW (5 cases)
for i in range(91, 96):
    app = create_base_app(i)
    app["scenario_tags"].append("AMBIGUOUS_CASE")
    app["manual_review_expected"] = True
    if i % 2 == 0:
        app["income"]["marital_status"] = "Married"
        app["notes"] = "Married candidate. Central guideline ambiguous on spousal income."
        add_manifest(app, "Married candidate income check.", review=True)
    else:
        app["category"]["domicile_state"] = "Unknown"
        app["notes"] = "Unclear domicile proof. Requires state specific rule."
        add_manifest(app, "Domicile ambiguous.", review=True)
    apps.append(app)

# 96-100: STATE_DEPENDENCY (5 cases)
for i in range(96, 101):
    app = create_base_app(i)
    app["scenario_tags"].append("STATE_DEPENDENCY")
    app["state_rule_dependency"] = True
    app["notes"] = "Institution empanelment depends on State list."
    apps.append(app)
    add_manifest(app, "Empanelment verification required via State list.")

with open('applications.json', 'w') as f:
    json.dump(apps, f, indent=4)

with open('applications.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    headers = ["application_id", "synthetic_profile_id", "scheme", "policy_version", "academic_year", "application_type", "student_name", "student_dob", "student_gender", "claimed_category", "domicile_state", "family_income_annum", "scenario_tags", "notes"]
    writer.writerow(headers)
    for app in apps:
        writer.writerow([
            app["application_id"],
            app["synthetic_profile_id"],
            app["scheme"],
            app["policy_version"],
            app["academic_year"],
            app["application_type"],
            app["student"]["name"],
            app["student"]["dob"],
            app["student"]["gender"],
            app["category"]["claimed_category"],
            app["category"]["domicile_state"],
            app["income"]["family_income_annum"],
            "|".join(app["scenario_tags"]),
            app["notes"]
        ])

with open('scenario_manifest.md', 'w') as f:
    f.write("# Scenario Manifest: Post-Matric Synthetic Dataset\n\n")
    f.write("| Application ID | Scenario Tag | Short Scenario Description | Policy Version | Expected Documents | Special Conditions | Manual Review | Notes |\n")
    f.write("|---|---|---|---|---|---|---|---|\n")
    for m in manifest:
        f.write(f"| {m['Application ID']} | {m['Scenario tag']} | {m['Short scenario description']} | {m['Policy version']} | {m['Expected document situation']} | {m['Special conditions']} | {m['Whether later manual review is expected']} | {m['Notes']} |\n")

print(f"Generated {len(apps)} applications.")
