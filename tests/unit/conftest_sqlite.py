"""
tests/unit/conftest_sqlite.py — shared SQLite test infrastructure.

SQLite does not support PostgreSQL's JSONB type. This module patches
SQLiteTypeCompiler so that JSONB columns render as TEXT (compatible
with SQLite's JSON1 extension) during test table creation.

This is purely a test-time patch and has zero effect on production code.
"""


def patch_jsonb_for_sqlite():
    """
    Teach SQLite's DDL compiler to render JSONB as JSON.
    Must be called once, before Base.metadata.create_all() is invoked
    for a SQLite engine.
    """
    from sqlalchemy.dialects.sqlite.base import SQLiteTypeCompiler

    if not hasattr(SQLiteTypeCompiler, "visit_JSONB"):
        def visit_JSONB(self, type_, **kw):
            # SQLite has no JSONB; render as TEXT which stores JSON fine
            return "TEXT"

        SQLiteTypeCompiler.visit_JSONB = visit_JSONB
