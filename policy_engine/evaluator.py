from typing import Dict, Any, List
import uuid

from .schemas import RuleEvaluationResult, PolicyRule, NormalizedInputs, PolicyEvaluationSummary
from .rule_registry import RULE_EVALUATORS
from .loader import load_rules
from .input_resolver import resolve_inputs

class PolicyEvaluator:
    def __init__(self, rules_dir: str | None = None):
        if not rules_dir:
            import os
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            rules_dir = os.path.join(base_dir, "dataset", "policies", "extracted_rules", "post_matric")
        self.rules = load_rules(rules_dir)
        
    def evaluate(self, app_id: str, app_data: Dict[str, Any], validation_data: Dict[str, Any]) -> PolicyEvaluationSummary:
        inputs = resolve_inputs(app_data, validation_data)
        evaluations: List[RuleEvaluationResult] = []
        
        pass_count = 0
        fail_count = 0
        manual_review_count = 0
        na_count = 0
        
        for rule_id, rule in self.rules.items():
            if rule_id not in RULE_EVALUATORS:
                # If a rule is not implemented, flag it for manual review
                status = "MANUAL_REVIEW_REQUIRED"
                expected = "Implemented evaluation"
                actual = "Not implemented"
                reason = "Rule logic not deterministically implemented in registry."
            else:
                eval_func = RULE_EVALUATORS[rule_id]
                status, expected, actual, reason = eval_func(rule, inputs)
                
            # Create RuleEvaluationResult
            result = RuleEvaluationResult(
                evaluation_id=f"EVAL-{uuid.uuid4().hex[:8].upper()}",
                application_id=app_id,
                rule_id=rule.rule_id,
                policy_version=rule.policy_version,
                status=status,
                inputs=inputs.model_dump(),
                expected_condition=expected,
                actual_value=actual,
                reason=reason,
                source_reference=rule.source
            )
            
            evaluations.append(result)
            
            if status == "PASS": pass_count += 1
            elif status == "FAIL": fail_count += 1
            elif status == "MANUAL_REVIEW_REQUIRED": manual_review_count += 1
            elif status == "NOT_APPLICABLE": na_count += 1
            
        return PolicyEvaluationSummary(
            application_id=app_id,
            policy_version="PM-2022",
            total_rules_evaluated=len(evaluations),
            pass_count=pass_count,
            fail_count=fail_count,
            manual_review_count=manual_review_count,
            not_applicable_count=na_count,
            rule_evaluations=evaluations
        )
