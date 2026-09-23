# Evidence & Explainability (Step 14)

## Architecture Principles
The Evidence and Explainability layer is an auditability layer designed to enforce the operational model: **AI ASSISTS, RULES GOVERN, OFFICER DECIDES.**

It acts as a downstream traceability builder that bridges raw findings to their exact root-cause data points. It does **not** autonomously reclassify findings, nor does it generate new final application status (`APPROVED`/`REJECTED`).

### The Explanation Chain
Every generated Explanation follows a strict hierarchy:
`VALUE → EVIDENCE → VALIDATION FINDING/RULE → POLICY VERSION → REASON → ACTION`

It is structured into `ExplanationChain` models that encapsulate:
1. The extracted `EvidenceRecords` (which specific document/page/field caused the issue).
2. The `RuleReference` (which version of the policy governed this evaluation).
3. The `StructuredExplanation` (A tiered human-readable translation: `SHORT_REASON`, `DETAILED_REASON`, `ACTION_GUIDANCE`).

## Evidence Models
- **Single-Document Finding**: Represented by a single `EvidenceRecord` (e.g. missing document, income threshold).
- **Cross-Document Finding**: Represented by multiple `EvidenceRecord`s in the chain array (e.g. `NAME_CONSISTENCY`), showing the conflicting values side-by-side.
- **Exceptions**: Manual review cases are explicitly handled, preserving the exact policy rule ambiguity without pretending to have algorithmic confidence.

## Data Lineage & Identifiers
`evidence_id` and `finding_id` values are deterministically hashed from the `application_id`, upstream `source_id` (like a policy rule or validation ID), and specific `field` names. This guarantees collision-free tracking across pipeline runs.

If a document is corrected and the pipeline is re-run, a **new verification run** will occur in the future orchestration step. The evidence engine does not overwrite historical records; it treats them as immutable point-in-time observations.

## Evaluation Methodology & Limitations
The `evidence_evaluation.py` harness strictly computes linkage coverage (i.e. what % of true positive ground truth findings are successfully linked to evidence arrays and policy versions). 

**IMPORTANT LIMITATIONS ON CURRENT METRICS**:
- **Confidence Metrics**: The current Step 10 OCR benchmark is a synthetic direct-text baseline and does not establish real-world OCR accuracy. Therefore, `extraction_confidence` is forced to `NOT_AVAILABLE`.
- **Verification Run IDs**: Legacy GT files do not support UUID run tracking natively. Evaluated as `NOT_AVAILABLE`.
- **Cross-Document GT Linking**: Legacy evidence GT only contained single-document missing issues. Our engine expands to track complex multi-doc mismatches. We mark cross-document ground truth evaluation completeness as `NOT_AVAILABLE` rather than fabricating synthetic labels.

## Real Data Boundary
The Step 12.5 Real OGD dataset is explicitly excluded from applicant-level evidence generation. It is an aggregate reference entity. No real PII is generated or exposed in this layer.
