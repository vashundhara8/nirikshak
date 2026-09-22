import os
import glob
from typing import Dict
import yaml

from .schemas import PolicyRule, PolicySource

def parse_parameters(param_str: str) -> dict:
    if not param_str.strip():
        return {}
    try:
        return yaml.safe_load(param_str) or {}
    except Exception:
        return {}

def load_rules(rules_dir: str = "dataset/policies/extracted_rules/post_matric") -> Dict[str, PolicyRule]:
    """Loads markdown policy rules into PolicyRule objects."""
    rules = {}
    pattern = os.path.join(rules_dir, "*.md")
    
    for file_path in glob.glob(pattern):
        if os.path.basename(file_path).startswith("README"):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().split('---')
            
        for block in content:
            if 'rule_id:' not in block:
                continue
                
            lines = block.strip().split('\n')
            raw_rule = {}
            current_key = None
            current_val = []
            
            for line in lines:
                if ':' in line and not line.startswith(' '):
                    if current_key:
                        raw_rule[current_key] = '\n'.join(current_val).strip()
                    
                    k, v = line.split(':', 1)
                    current_key = k.strip()
                    current_val = [v.strip()]
                else:
                    if current_key:
                        current_val.append(line)
                        
            if current_key:
                raw_rule[current_key] = '\n'.join(current_val).strip()
                
            source = PolicySource(
                source_id=raw_rule.get('source_id', ''),
                source_document=raw_rule.get('source_document', ''),
                source_page=raw_rule.get('source_page', ''),
                source_section=raw_rule.get('source_section', ''),
                source_reference=raw_rule.get('source_reference', '')
            )
            
            rule = PolicyRule(
                rule_id=raw_rule.get('rule_id', ''),
                scheme=raw_rule.get('scheme', ''),
                policy_version=raw_rule.get('policy_version', ''),
                rule_type=raw_rule.get('rule_type', ''),
                rule_statement=raw_rule.get('rule_statement', ''),
                parameters=parse_parameters(raw_rule.get('parameters', '')),
                source=source,
                effective_from=raw_rule.get('effective_from', ''),
                effective_to=raw_rule.get('effective_to', ''),
                verification_status=raw_rule.get('verification_status', ''),
                notes=raw_rule.get('notes', '')
            )
            rules[rule.rule_id] = rule
            
    return rules
