# Step 15: Backend Domain & API Integration

## Architecture
The MoTA Scholarship Intelligence platform has been augmented with a production-grade backend orchestrator designed to run locally, on MinIO, and PostgreSQL.

### Database
- **PostgreSQL 16+**: Required explicitly. (SQLite explicitly disabled).
- **SQLAlchemy 2.x**: Advanced ORM.
- **Alembic**: Migration scripts manage all schema revisions (BLOCKED locally due to Docker unavailability in this environment).

### Authentication & MFA
- **Argon2id**: High-security password hashing.
- **JWT**: Short-lived access tokens and long-lived revocable refresh tokens.
- **OTP/MFA**: Abstracted `OTPProvider`. Must be "production" environment safe. Development mode uses fixed fallbacks.

### RBAC & Scope Authorization
Roles include `APPLICANT`, `INSTITUTE_OFFICER`, `DISTRICT_OFFICER`, `STATE_OFFICER`, `MINISTRY_ADMIN`, and `AUDITOR`.
Authorization happens in 3 phases:
1. Authentication (JWT Validity)
2. Permissions (RBAC validation via `RoleChecker`)
3. Resource Check (Scope: e.g., Applicant A cannot access Applicant B's IDOR).

### Document Security & Storage
- Abstracted `DocumentStorage` handles both Local and MinIO modes.
- `DocumentSecurityScanner` guards against malware and large files. Production mode requires enterprise scanning implementation (ClamAV, etc.), else fails closed.
- MinIO produces short-lived signed URLs for consumption.

### Verification Orchestration
Centralized `VerificationService` transactionally chains logic:
- Snapshots Application State with Optimistic Concurrency Control.
- Freezes Input Document Versions.
- Invokes Steps 10-14.
- Persists an immutable `VerificationRun` tying Evidence, Findings, and Deficiencies.

### Deficiencies & Evidence
- **Exception vs Deficiency**: AI assists, rules govern, officers decide. No LLM independently rejects applications.
- Evidence references exact hashes of input document fields, ensuring true auditability.

### Rate Limiting & Background Jobs
- **Celery / Redis**: Orchestrates asynchronous workloads (OCR). Fallback behavior explicitly logs failure if Redis is unavailable in production.
- **Rate Limiting**: Enforced via Redis on sensitive API endpoints.

## Known Limitations
1. **Docker Unavailable**: `docker-compose.yml` provides the containerized PostgreSQL, Redis, and MinIO infrastructure. The native environment is unable to launch this, thus database migrations (`alembic upgrade head`) and API smoke testing were safely skipped to avoid fake/SQLite substitutions.
2. **Malware Scanning**: Production file scanning requires an external provider. Currently defaults to blocking in production unless explicitly mocked in dev.
