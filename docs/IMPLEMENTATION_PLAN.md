# Implementation Plan

## PHASE 0: Project setup
- **Objective:** Initialize repository, frameworks, and configuration.
- **Definition of Done:** `npm run dev` and `uvicorn main:app` load successfully; Docker containers run.

## PHASE 1: Database and domain models
- **Objective:** Define and apply the relational schema (Applications, Verification Runs, Evidence, etc.).
- **Definition of Done:** Migrations run successfully, models can be queried via Pytest.

## PHASE 2: Policy dataset
- **Objective:** Create JSON/YAML representations of deterministic rules.
- **Definition of Done:** Policy engine can load and parse rules; sources tracked.

## PHASE 3: Synthetic application dataset
- **Objective:** Generate carefully designed scenario-driven applicant profiles.
- **Definition of Done:** JSON profiles match scenarios (valid, mismatched, exceptions).

## PHASE 4: Synthetic documents
- **Objective:** Generate PDFs/Images mapping to application scenarios with quality labels.
- **Definition of Done:** Scripts output PDFs representing clean to noisy documents.

## PHASE 5: Ground truth + evaluation harness
- **Objective:** Build ground truth framework for verification runs and expected evidence.
- **Definition of Done:** Evaluation script can ingest ground truth and compare against system output.

## PHASE 6: Document ingestion
- **Objective:** Build upload pipeline and MinIO integration.
- **Definition of Done:** File uploads successfully store to object storage via API.

## PHASE 7: OCR and extraction
- **Objective:** Extract structured data where text isn't available, applying LLM only when required.
- **Definition of Done:** Extraction pipeline outputs JSON fields.

## PHASE 8: Cross-document validation
- **Objective:** Match fields across multiple documents.
- **Definition of Done:** Logic accurately compares attributes like Name, DOB, and Income.

## PHASE 9: Policy Engine
- **Objective:** Evaluate extracted data against active policy versions.
- **Definition of Done:** Engine outputs Policy Result per rule deterministically.

## PHASE 10: Deficiency/Exception Engine
- **Objective:** Aggregate validation/policy results into actionable exceptions.
- **Definition of Done:** Failures map to standard deficiency codes and queue for review.

## PHASE 11: Evidence/Explainability
- **Objective:** Generate natural-language and visual evidence mapping (VALUE → EVIDENCE → RULE → REASON).
- **Definition of Done:** Evidence objects properly reference source docs and rule IDs.

## PHASE 12: Core Verification UI
- **Objective:** Build the foundational UI components for document viewing and data display.
- **Definition of Done:** UI components render without breaking.

## PHASE 13: Officer Verification Workspace
- **Objective:** Assemble the three-panel layout (Docs, Extracted Data, Verification Results & Evidence).
- **Definition of Done:** **DOCUMENT VERIFICATION IS DONE ONLY WHEN:** document upload works, classification works, extraction works, normalization works, cross-document validation works, policy evaluation works, exceptions are generated, evidence is stored, officer can review, result is auditable, automated tests pass.

## PHASE 14: Applicant Dashboard
- **Objective:** Build the Applicant UI for uploads and status checks.
- **Definition of Done:** Applicant can upload documents and respond to corrections triggering new verification runs.

## PHASE 15: Lifecycle
- **Objective:** Track application state changes and verification runs.
- **Definition of Done:** State transitions reflect in the API and audit logs correctly.

## PHASE 16: Analytics
- **Objective:** Provide operational visibility and bottlenecks.
- **Definition of Done:** Dashboard renders correctly with data.

## PHASE 17: Integration testing
- **Objective:** End-to-end tests against the 100-application scenario dataset.
- **Definition of Done:** Pipeline runs fully against dataset, evaluation metrics calculated.

## PHASE 18: Demo preparation
- **Objective:** Seed specific compelling demo cases, focusing on the Officer Workspace.
- **Definition of Done:** Flawless execution of the defined demo script.
