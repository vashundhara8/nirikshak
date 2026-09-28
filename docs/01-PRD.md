# Product Requirements Document

## 1. Product Name
MoTA Scholarship Intelligence & Lifecycle Platform

## 2. Product Vision
To provide a secure, policy-aware and explainable intelligent verification and lifecycle layer that complements existing scholarship infrastructure such as NSP, DBT and PFMS, helping officers process applications more consistently, transparently and efficiently while retaining human decision authority.

## 3. Problem Statement
The current scholarship verification process is highly manual, error-prone, and time-consuming. Human officers struggle to cross-verify numerous documents (income certificates, domicile, marksheets) against complex and evolving eligibility rules. This leads to bottlenecks, delayed disbursements, inconsistencies, and a lack of clear audit trails for decision-making.

## 4. Current Ecosystem Context
The MoTA ecosystem relies on several portals:
- National Scholarship Portal (NSP)
- State-specific scholarship portals
- DBT (Direct Benefit Transfer)
- PFMS (Public Financial Management System)
Our platform does **not** aim to replace these systems. Instead, it acts as an intelligent verification and lifecycle layer that can ingest data from these systems, run explainable verification, and return actionable decisions.

## 5. Target Users
- **Applicant:** Students applying for scholarships.
- **Institute Officer:** First-level verifier at the educational institution.
- **District Officer:** Second-level verifier at the district nodal level.
- **State Officer:** Third-level verifier at the state nodal level.
- **Ministry Administrator:** Policy makers and system administrators at MoTA.
- **Auditor:** External/Internal personnel reviewing verification trails.

## 6. User Roles
- APPLICANT
- INSTITUTE_OFFICER
- DISTRICT_OFFICER
- STATE_OFFICER
- MINISTRY_ADMIN
- AUDITOR

## 7. Core USP
**Policy-Aware, Explainable Scholarship Verification.**
The platform explains every important finding using:
**VALUE → EVIDENCE → RULE → REASON.**

## 8. Product Objectives

- Automate document classification and data extraction.
- Provide cross-document consistency checks.
- Apply deterministic scheme-specific and academic-year-specific government rules.
- Detect missing documents, mismatches, inconsistencies, and exceptions.
- Provide a clear audit trail and explainable UI for human officers.

## 9. Non-goals
- Do not build another generic scholarship portal.
- Do not replace PFMS, DBT, or NSP.
- Do not use an LLM as the eligibility authority (AI does not make final decisions).
- Do not claim automated approval without human oversight.
- Do not introduce blockchain, face recognition or unnecessary hardware.

## 10. Core User Journeys
1. **Applicant:** Uploads documents -> System checks completeness -> Flags missing/unreadable files -> Applicant submits.
2. **Officer:** Opens verification workspace -> System presents extracted data, cross-document validations, and policy evaluations -> Officer reviews the evidence and submits a final administrative decision: approve, reject, or request correction, subject to the applicable workflow and policy.
3. **Auditor:** Views application history -> Traces exact policy version applied -> Views extracted evidence and officer decision logs.

## 11. MVP Scope
The MVP will focus deeply on:
**POST-MATRIC SCHOLARSHIP FOR ST STUDENTS**
The MVP will demonstrate the core pipeline:
Applicant/Documents → Document Intelligence → Cross-document Validation → Policy Engine → Exception/Deficiency Engine → Explainability → Officer Review → Decision → Audit/Lifecycle.

## 12. Future Scope
- Pre-Matric Scholarship
- Top Class Education
- National Fellowship
- National Overseas Scholarship
- Deep integration with DigiLocker/API Setu.

## 13. Functional Requirements
- **Document Intelligence:** Classify documents, OCR, extract structured fields, normalize data.
- **Cross-document Validation:** Match fields across multiple documents (e.g., Name in Aadhar vs. Marksheet vs. Income Certificate).
- **Policy Engine:** Evaluate deterministic rules (e.g., Income threshold defined by the active policy version). *Requires verification against official/current policy source.*
- **Exception Routing:** Flag anomalies and route to human officers.
- **Verification Runs:** Verification runs must be versioned. Every verification execution should create a separate `verification_run` record (e.g., Application -> Verification Run #1, Run #2, etc.).
- **Audit Trail:** Log all AI extractions, rule evaluations, and human decisions. Every policy evaluation must identify scheme + academic year + policy version.

## 14. Non-functional Requirements
- **Modularity:** Architecture must be configurable for multiple MoTA schemes.
- **Explainability:** Every major verification finding must be explainable.
- **Performance:** Document processing and rule evaluation under defined SLAs.

## 15. Responsible AI Requirements
**AI ASSISTS. RULES GOVERN. OFFICER DECIDES.**
- AI/ML is strictly limited to OCR, classification, extraction, matching assistance, anomaly flags, and natural-language explanations.
- AI must NOT make the final eligibility decision.

## 16. Security/Privacy Requirements
- Do not use real beneficiary PII during development/demo (use synthetic data).
- RBAC for all system actions.
- Secure storage of applicant documents.

## 17. Auditability Requirements
- Every verification finding must be explainable.
- Every policy evaluation must identify scheme + academic year + policy version.
- Every officer decision must be auditable with timestamps and user IDs.

## 18. Success Criteria
- Reduction in verification time per application in demo scenario.
- 100% explainability for flagged exceptions.
- For a fixed policy version and normalized input, policy evaluation must be deterministic and reproducible.

## 19. Demo Scenario
1. Upload several scholarship documents.
2. System identifies documents, extracts fields, compares fields.
3. System detects mismatch/deficiency and identifies applicable policy.
4. System shows evidence + rule + reason.
5. Officer reviews the evidence and submits a final administrative decision.
6. Failed checks are re-run upon correction (as a new versioned verification run).
7. Final decision is recorded in the audit trail.

## 20. Acceptance Criteria
- Policy engine strictly relies on deterministic rules, not LLMs.
- All MVP functional requirements implemented and demonstrable via synthetic data.
- User Interface clearly maps DOCUMENTS → EXTRACTED DATA → VALIDATION → POLICY RESULT → EVIDENCE → OFFICER DECISION.

*OPEN QUESTION: Need official confirmation on the exact income limits and document requirements for the current academic year Post-Matric scheme. SOURCE VERIFICATION REQUIRED.*
