import json
import os
from typing import List, Dict, Any
from .engine import DeficiencyEngine

def run_deficiency_pipeline(validation_file: str, policy_file: str, output_dir: str):
    with open(validation_file, 'r', encoding='utf-8') as f:
        validations = json.load(f)
        
    with open(policy_file, 'r', encoding='utf-8') as f:
        policies = json.load(f)
        
    # Group by app_id
    val_by_app = {}
    for v in validations:
        app_id = v["application_id"]
        val_by_app.setdefault(app_id, []).append(v)
        
    pol_by_app = {}
    for p in policies:
        app_id = p["application_id"]
        pol_by_app.setdefault(app_id, []).extend(p.get("rule_evaluations", []))
        
    all_apps = set(val_by_app.keys()) | set(pol_by_app.keys())
    
    engine = DeficiencyEngine()
    summaries = []
    
    for app_id in all_apps:
        app_vals = val_by_app.get(app_id, [])
        app_pols = pol_by_app.get(app_id, [])
        summary = engine.process_application(app_id, app_vals, app_pols)
        # Using dict() on pydantic model, compatible with v2 dump
        summaries.append(summary.model_dump() if hasattr(summary, "model_dump") else summary.dict())
        
    os.makedirs(output_dir, exist_ok=True)
    
    # Write flat list of deficiencies
    all_deficiencies = []
    for s in summaries:
        all_deficiencies.extend(s["deficiencies"])
        
    def_path = os.path.join(output_dir, "deficiency_predictions.json")
    with open(def_path, 'w', encoding='utf-8') as f:
        json.dump(all_deficiencies, f, indent=2)
        
    # Write full summaries
    sum_path = os.path.join(output_dir, "deficiency_summary.json")
    with open(sum_path, 'w', encoding='utf-8') as f:
        json.dump(summaries, f, indent=2)
        
    print(f"Generated {len(all_deficiencies)} deficiencies across {len(summaries)} applications.")
    return all_deficiencies, summaries
