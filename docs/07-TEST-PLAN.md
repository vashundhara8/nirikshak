# Test Plan & Strategy

## 1. Overview
The testing strategy ensures that the system is deterministic, auditable, and accurate across its pipeline from document ingestion to policy evaluation.

## 2. Unit Tests
- **Policy Rules:** Verify that individual rules evaluate correctly against mocked normalized data.
- **Normalization:** Ensure date formats, currency strings, and name variations are standardized correctly.
- **Matching Logic:** Test fuzzy matching and exact matching algorithms for cross-document validation.
- **Deficiency Codes:** Verify that specific mismatches map to the correct exception codes.
- **Evidence Mapping:** Ensure that generated evidence objects correctly link the VALUE, SOURCE, and RULE.

## 3. Golden Document Tests
- **Objective:** Establish a baseline for document extraction.
- **Process:** Feed a known synthetic document into the pipeline and assert that the extracted fields match the exact expected JSON output.

## 4. Integration Tests
- **Pipeline Flow:** `Upload → OCR → extraction → validation → policy → exception → evidence`
- **Objective:** Verify that the components interact correctly and produce the expected verification run payload.

## 5. End-to-End Tests
- **Scenario Flow:** `Upload → Verify → Exception → Correction → Reverify → Officer decision → Audit`
- **Objective:** Simulate the full lifecycle of an application, including corrections which trigger a new versioned verification run, and ensure the audit trail accurately records the officer's decision linked to the correct run.

## 6. Regression Testing
- **Policy Changes:** Every time a change is made to the Policy Engine or a policy schema, the entire ground-truth dataset must be re-run to ensure no unintended consequences.

## 7. Evaluation Metrics
The following metrics will be calculated during Phase 17 against the synthetic ground truth:
- **Document classification:** Precision, Recall, F1-Score.
- **OCR:** Character Error Rate (CER), Word Error Rate (WER).
- **Field extraction:** Field-level Precision and Recall.
- **Cross-document validation:** Accuracy of match/mismatch flags.
- **Deficiency detection:** True Positive Rate, False Positive Rate.
- **Policy determinism:** 100% reproducibility for identical normalized input and policy version.
- **Evidence mapping:** Correctness of the source document/page references in the evidence object.

*Note: Target accuracy numbers will be established after the initial baseline evaluation. No numbers are fabricated prior to testing.*
