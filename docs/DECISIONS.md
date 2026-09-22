# Architecture Decision Records (ADR)

## Decision 001: Deterministic Policy Engine controls eligibility.
**Status:** Accepted
**Reason:** Official scholarship rules must be traceable and auditable. Probabilistic models (LLMs) cannot guarantee 100% adherence to complex financial and demographic eligibility thresholds. A deterministic engine ensures legal compliance.

## Decision 002: AI assists document processing but does not make final eligibility decisions.
**Status:** Accepted
**Reason:** To adhere to the responsible AI principle (AI Assists, Rules Govern, Officer Decides). AI is used where it excels (OCR, unstructured extraction, natural language generation) but never acts as the final arbiter.

## Decision 003: Use synthetic data for development/demo.
**Status:** Accepted
**Reason:** Real beneficiary PII is highly sensitive. Using synthetic data ensures privacy, allows us to open-source or share the prototype without legal risk, and lets us intentionally engineer specific edge cases for evaluation.

## Decision 004: Post-Matric is the first deeply implemented scheme.
**Status:** Accepted
**Reason:** Post-Matric has complex requirements that thoroughly test the system (income certificates, institution validation, domicile). It serves as the perfect MVP to prove out the architecture before scaling to simpler or equally complex schemes.

## Decision 005: Existing government systems are treated as integration boundaries, not replaced.
**Status:** Accepted
**Reason:** MoTA, NSP, DBT, and PFMS are massive, established systems. Proposing to replace them is unrealistic and outside the scope of SIH 2026. Acting as an intelligent middleware/layer is highly feasible and adds immediate value.

## Decision 006: Verification runs are immutable historical executions.
**Status:** Accepted
**Reason:** Corrections and re-verification must not overwrite previous verification evidence. Each run is versioned.

## Decision 007: Evidence is a first-class domain object.
**Status:** Accepted
**Reason:** The core USP requires every important finding to map back to source evidence and policy. Evidence must be explicitly stored and traceable.

## Decision 008: The MVP prioritizes the Officer Verification Workspace over broad dashboard functionality.
**Status:** Accepted
**Reason:** The officer verification experience is the core demonstration of the product's value. It visually demonstrates the entire pipeline from document intelligence to policy evaluation and human decision.

## Future Decisions
*(Leave blank for future technical, architectural, or product decisions during development)*
