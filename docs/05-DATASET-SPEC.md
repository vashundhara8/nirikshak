# Dataset Specification

**THIS IS A CRITICAL DOCUMENT.**

## 1. Dataset Architecture
The dataset must be:
- Synthetic and privacy-safe.
- Reproducible and traceable to official public policy sources.
- Designed for evaluation and free from real beneficiary PII.

## 2. Initial Dataset Scope
**Focus:** Post-Matric Scholarship
- **Start:** 100 carefully designed synthetic application scenarios.
- **Scale Later:** 100 → 500 → 2,000.
*Do NOT simply generate 100 random synthetic applications. The initial applications must be carefully designed scenarios with known ground truth.*

## 3. Dataset Structure
```text
dataset/
├── policies/
├── applications/
├── documents/
│   ├── st_certificates/
│   ├── income_certificates/
│   ├── domicile/
│   ├── marksheets/
│   └── bank_documents/
├── ground_truth/
└── evaluation/
```

## 4. Schemas Definitions
1. **Policy Records:** JSON/YAML defining rules (e.g., scheme, academic year, income threshold).
2. **Application Records:** Core application metadata.
3. **Applicant Records:** Applicant profile data.
4. **Document Metadata:** File paths, expected document types.
5. **Extracted Fields:** Key-value pairs expected from OCR.
6. **Verification Results:** Pass/Fail for cross-document checks.
7. **Deficiencies:** Expected missing/invalid flags.
8. **Exceptions:** Edge cases requiring manual review.
9. **Expected Evidence:** The exact fields and source documents expected to flag.
10. **Ground Truth:** The definitive expected state for an application and its verification runs.
11. **Evaluation Metrics:** Definitions for scoring system performance.

## 5. Scenario-Driven Test Categories
Define scenario categories such as:
- completely valid application
- missing document
- invalid document
- name mismatch
- DOB mismatch
- income exception
- category/certificate issue
- institution mismatch
- multiple simultaneous issues
- ambiguous/manual-review case
- duplicate-like application
- OCR noise
- poor-quality document
- inconsistent formatting

*Note: Do not assign percentages unless supported by real evidence. These are TEST SCENARIOS, not real-world distributions.*

## 6. Verification-Run Ground Truth & Expected Evidence
Ground truth must support versioned verification runs:
`Application → Verification Run → Expected validation results → Expected policy results → Expected exceptions → Expected evidence → Expected final review action`

Example JSON structure for ground truth:
```json
{
  "application_id": "APP-001",
  "expected_issues": [
    "NAME_MISMATCH"
  ],
  "expected_evidence": [
    {
      "document": "marksheet.pdf",
      "page": 1,
      "field": "name",
      "expected_value": "Rahul Kumar"
    },
    {
      "document": "income_certificate.pdf",
      "page": 1,
      "field": "name",
      "expected_value": "Rahul Kumaar"
    }
  ]
}
```
This allows evaluation of whether the system identified the CORRECT evidence, not merely whether it detected an issue.

## 7. Policy Dataset Traceability
Every policy rule must preserve source traceability. Conceptual fields:
- `policy_id`, `scheme_id`, `academic_year`, `policy_version`
- `rule_id`, `rule_type`, `parameters`
- `source_document`, `source_page`, `source_reference`
- `effective_dates`, `verification_status`

*Do NOT invent government rules. Any rule whose current value has not been verified must be marked: **SOURCE VERIFICATION REQUIRED**.*

## 8. Document Quality Labels
Define document-quality categories for controlled evaluation of OCR and extraction:
- `clean`, `low_resolution`, `blurred`, `rotated`, `partially_cut`, `noisy`, `complex_layout`, `difficult_scan`

## 9. Evaluation Metrics
Define metrics for:
- Document classification (Accuracy, F1-Score).
- OCR (Character Error Rate - CER, Word Error Rate - WER).
- Field extraction (Precision, Recall).
- Normalization (Success rate).
- Cross-document validation (Accuracy).
- Deficiency detection (True Positive Rate, False Positive Rate).
- Policy determinism (Policy evaluation must be deterministic and reproducible for identical normalized input + identical policy version).
- Explainability evidence mapping (Correctness of mapping).

*Note: Do not fabricate accuracy numbers. Do not claim "100% accuracy" before testing.*
