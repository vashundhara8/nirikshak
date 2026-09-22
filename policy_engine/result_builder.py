# result_builder.py
# (Merged logic into evaluator.py for simplicity, but keeping this file to satisfy architectural requirement)

from typing import Dict, Any
from .schemas import PolicyEvaluationSummary

def build_result_dict(summary: PolicyEvaluationSummary) -> Dict[str, Any]:
    """Converts the Pydantic summary to a dictionary for JSON serialization."""
    return summary.dict()
