"""
tests/unit/conftest.py

Unit-test conftest: patches SQLiteTypeCompiler to render JSONB as JSON
before any test module runs. This makes all in-memory SQLite test DBs
work with the production models that use PostgreSQL-specific JSONB columns.
"""
from tests.unit.conftest_sqlite import patch_jsonb_for_sqlite

# Apply the patch immediately at collection time
patch_jsonb_for_sqlite()
