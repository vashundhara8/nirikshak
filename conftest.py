"""
Root conftest.py — adds the repository root to sys.path so that both
the `backend` package (backend/app/...) and the `ai` package (ai/...)
can be imported from any test file without install steps.
"""
import sys
import os

# Ensure the repository root is on sys.path
repo_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(repo_root, "backend")

for path in (repo_root, backend_dir):
    if path not in sys.path:
        sys.path.insert(0, path)
