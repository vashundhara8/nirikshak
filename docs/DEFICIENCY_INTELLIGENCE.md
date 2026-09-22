# Deficiency & Exception Intelligence (Step 13)

## Architectural Principle
The Deficiency and Exception Intelligence layer follows a strict operational responsibility model:
**AI ASSISTS, RULES GOVERN, OFFICER DECIDES.**

It acts as a deterministic aggregation engine. It consumes findings from Cross-Document Validation (Step 11) and the Policy Engine (Step 12), transforming them into actionable, routing-aware operational records. 

It does **not** evaluate policy on its own. It does **not** decide whether a student receives a scholarship. It does **not** produce `APPROVED` or `REJECTED` states. It solely produces `OperationalStatus` summaries (e.g., `CORRECTION_REQUIRED`, `MANUAL_REVIEW_REQUIRED`).

## Deficiencies vs. Exceptions

### Deficiencies
A **Deficiency** is a structural, data, or rule failure where a correction is required by the applicant, institution, or officer. It is mapped from upstream `FAIL` states (and specific `DOC` manual review cases).
- **Categories**: Identity, Date of Birth, Income, Institution, Course, Document, Duplicate, etc.
- **Severities**: 
  - `BLOCKING`: Immediately disqualifying unless corrected (e.g., Income above threshold, missing mandatory document).
  - `HIGH`: Major discrepancies (e.g., Name mismatch across 3+ documents).
  - `MEDIUM` / `LOW` / `INFO`: Minor issues.
- **Rerun Scope**: Defines the exact verification boundary to re-evaluate when the underlying data is corrected (e.g., changing Domicile triggers `DOMICILE_VALIDATION` rerun).

### Exceptions
An **Exception** is a condition where the policy is ambiguous, inherently depends on an external state variable, or requires manual human verification. It maps from upstream `MANUAL_REVIEW_REQUIRED` states (and some `NOT_APPLICABLE` boundary conditions).
- **Types**: Policy Exception, State Dependency, Reference Data Dependency, Manual Verification.
- **Example**: Fee fixation depends on the State Level Fee Fixation Committee. This cannot be algorithmically verified. It produces an Exception requiring the `STATE_OFFICER` to input the fee structure.

## Deterministic Classifier Mapping
1. **Validation Findings**: 
   - Mismatches in critical fields (Name, DOB) map to `FIELD_MISMATCH` with `HIGH` severity.
   - Conflicts in deterministic thresholds (Category) map to `BLOCKING`.
2. **Policy Findings**: 
   - `INC` (Income) and `CAT` (Category) rules failing result in `THRESHOLD_FAILURE` (`BLOCKING`).
   - `DOC` (Document) rules flagged result in `MISSING_DOCUMENT` (`BLOCKING`).
3. **Exceptions**:
   - Upstream ambiguous rules (like fee definitions or orphan designations) result in `ExceptionRecord` requiring targeted `MANUAL_REVIEW`.

## Operational Summary
Each application receives an `ApplicationOperationalSummary` containing counts of issues and a final `operational_status`:
- `NO_DEFICIENCY`
- `CORRECTION_REQUIRED`
- `MANUAL_REVIEW_REQUIRED`
- `ACTION_REQUIRED` (If blocking or high severity deficiencies exist)
