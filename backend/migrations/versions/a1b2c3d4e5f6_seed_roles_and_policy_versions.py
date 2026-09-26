"""seed_roles_and_policy_versions

Revision ID: a1b2c3d4e5f6
Revises: 50b9949a751a
Create Date: 2026-09-26 14:00:00.000000

Seeds:
  - All canonical roles (APPLICANT, INSTITUTE_OFFICER, DISTRICT_OFFICER,
    STATE_OFFICER, MINISTRY_OFFICER, AUDITOR)
  - Initial PolicyVersion record for PM-2022 (Post Matric Scholarship)
    so that VerificationRun.policy_version_id is always populated.

Down revisions delete only the seeded rows, leaving the schema intact.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime, timezone
import uuid

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '50b9949a751a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Fixed UUIDs — deterministic so re-running is idempotent
ROLE_IDS = {
    "APPLICANT":        "11111111-0000-0000-0000-000000000001",
    "INSTITUTE_OFFICER":"11111111-0000-0000-0000-000000000002",
    "DISTRICT_OFFICER": "11111111-0000-0000-0000-000000000003",
    "STATE_OFFICER":    "11111111-0000-0000-0000-000000000004",
    "MINISTRY_OFFICER": "11111111-0000-0000-0000-000000000005",
    "AUDITOR":          "11111111-0000-0000-0000-000000000006",
}

# Single authoritative policy version for PM-2022
POLICY_VERSION_ID = "22222222-0000-0000-0000-000000000001"
POLICY_ACTIVE_FROM = datetime(2022, 4, 1, tzinfo=timezone.utc)


def upgrade() -> None:
    from sqlalchemy.dialects.postgresql import insert
    
    # ── 1. Roles ──────────────────────────────────────────────────────────
    roles_table = sa.table(
        "roles",
        sa.column("id", sa.UUID),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )
    
    stmt = insert(roles_table).values([
        {"id": ROLE_IDS["APPLICANT"],        "name": "APPLICANT",        "description": "Scholarship applicant"},
        {"id": ROLE_IDS["INSTITUTE_OFFICER"],"name": "INSTITUTE_OFFICER","description": "Institute-level verification officer"},
        {"id": ROLE_IDS["DISTRICT_OFFICER"], "name": "DISTRICT_OFFICER", "description": "District-level verification officer"},
        {"id": ROLE_IDS["STATE_OFFICER"],    "name": "STATE_OFFICER",    "description": "State-level verification officer"},
        {"id": ROLE_IDS["MINISTRY_OFFICER"], "name": "MINISTRY_OFFICER", "description": "MoTA Ministry-level officer and auditor"},
        {"id": ROLE_IDS["AUDITOR"],          "name": "AUDITOR",          "description": "Read-only audit role"},
    ]).on_conflict_do_nothing(index_elements=['name'])
    
    op.get_bind().execute(stmt)

    # ── 2. PolicyVersion for PM-2022 ──────────────────────────────────────
    # Stores a lightweight version descriptor; the actual rule definitions
    # live as YAML markdown files in dataset/policies/extracted_rules/.
    # The 'rules' JSONB field records the file set and commit hash so the
    # exact rules used for a VerificationRun can be reconstructed.
    policy_table = sa.table(
        "policy_versions",
        sa.column("id", sa.UUID),
        sa.column("scheme_code", sa.String),
        sa.column("version_tag", sa.String),
        sa.column("rules", sa.JSON),
        sa.column("active_from", sa.DateTime),
        sa.column("active_until", sa.DateTime),
        sa.column("created_at", sa.DateTime),
    )
    policy_stmt = insert(policy_table).values([
        {
            "id": POLICY_VERSION_ID,
            "scheme_code": "PM-2022",
            "version_tag": "PM-2022_V1",
            "rules": {
                "rule_files": [
                    "document_rules.md",
                    "eligibility_rules.md",
                    "income_rules.md",
                    "institution_rules.md",
                    "other_rules.md",
                    "renewal_rules.md",
                    "scholarship_rules.md",
                ],
                "rules_base_path": "dataset/policies/extracted_rules/post_matric",
                "description": "Post Matric Scholarship for ST students — 2022 policy rules",
            },
            "active_from": POLICY_ACTIVE_FROM,
            "active_until": None,
            "created_at": datetime.now(timezone.utc),
        }
    ]).on_conflict_do_nothing(index_elements=['id'])
    
    op.get_bind().execute(policy_stmt)


def downgrade() -> None:
    # Remove only the seeded policy version
    op.execute(
        f"DELETE FROM policy_versions WHERE id = '{POLICY_VERSION_ID}'"
    )
    # Remove only the seeded roles (by fixed IDs — avoids deleting user-created roles)
    ids = ", ".join(f"'{v}'" for v in ROLE_IDS.values())
    op.execute(f"DELETE FROM roles WHERE id IN ({ids})")
