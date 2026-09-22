# API Specification

## 1. Overview
RESTful API contract to ensure frontend and backend developers can work independently.

## 2. Common Standards
- **Authentication:** Bearer JWT in `Authorization` header.
- **Authorization:** RBAC enforced at endpoint level.
- **Pagination:** `?page=1&limit=20`
- **Filtering:** `?status=PENDING&scheme=POST_MATRIC`
- **Response Format:** JSON wrappers with `data` and `meta`.
- **Status Codes:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.

## 3. Example Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user, return JWT.
- `GET /api/auth/me` - Get current user profile and role.

### Applications & Lifecycle
- `POST /api/applications` - Create a new application.
- `GET /api/applications` - List applications (paginated, filtered).
- `GET /api/applications/{id}` - Get full application details.
- `GET /api/applications/{id}/lifecycle` - Get timeline of states.

### Documents
- `POST /api/applications/{id}/documents` - Upload a document (multipart/form-data).
- `GET /api/applications/{id}/documents` - List documents for an application.
- `GET /api/documents/{doc_id}/download` - Download document file.

### Verification Runs
- `POST /api/applications/{id}/verify` - Trigger AI/Policy pipeline (Idempotency key required).
- `GET /api/applications/{id}/verification-runs` - List all historical verification runs.
- `GET /api/verification-runs/{id}` - Get results of a specific verification run.
- `POST /api/applications/{id}/reverify` - Trigger a new verification run after corrections.

### Deficiencies & Exceptions
- `GET /api/applications/{id}/deficiencies` - List identified deficiencies/exceptions.
- `POST /api/deficiencies/{id}/resolve` - Resolve a specific deficiency (Applicant or Officer).

### Evidence
- `GET /api/verification-runs/{id}/evidence` - Fetch evidence for findings in a specific run.

### Policy
- `GET /api/policies/{scheme}/{academic_year}/versions` - Get available policy versions.
- `GET /api/policies/{scheme}/{academic_year}/{version}` - Get specific active policy JSON configuration.

### Officer Decisions
- `POST /api/applications/{id}/decision` - Submit a final administrative decision.

**Decision Model Structure:**
```json
{
  "decision": "REQUEST_CORRECTION",
  "reason_code": "DOB_MISMATCH",
  "comment": "Please provide corrected document.",
  "evidence_ids": ["EV-102", "EV-103"],
  "user_id": "OFFICER-441",
  "timestamp": "2026-09-22T10:00:00Z",
  "verification_run_id": "VR-9923"
}
```
*Do not allow a generic decision without audit context (like `verification_run_id` and `evidence_ids`).*

### Analytics
- `GET /api/analytics/dashboard` - Get high-level stats for the current role.

### Audit
- `GET /api/applications/{id}/audit` - Get the immutable audit trail for the application.

### Users
- `GET /api/users` - List users (Admin only).
- `POST /api/users` - Create a user.

## 4. API Safety
Where appropriate, idempotency keys or request identifiers must be documented for operations such as:
- verification
- re-verification
- decision
- deficiency resolution
