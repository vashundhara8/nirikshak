import json
import os
from typing import List, Dict, Any
from .engine import EvidenceEngine

def run_evidence_pipeline(
    validation_file: str, 
    policy_file: str, 
    deficiency_file: str, 
    exception_file: str, 
    output_dir: str
):
    with open(validation_file, 'r', encoding='utf-8') as f:
        validations = json.load(f)
        
    with open(policy_file, 'r', encoding='utf-8') as f:
        policies = json.load(f)
        
    with open(deficiency_file, 'r', encoding='utf-8') as f:
        deficiencies = json.load(f)
        
    exceptions = []
    if os.path.exists(exception_file):
        with open(exception_file, 'r', encoding='utf-8') as f:
            app_summaries = json.load(f)
            for summ in app_summaries:
                exceptions.extend(summ.get("exceptions", []))

    # Group by app_id
    val_by_app = {}
    for v in validations:
        app_id = v["application_id"]
        val_by_app.setdefault(app_id, []).append(v)
        
    pol_by_app = {}
    for p in policies:
        app_id = p["application_id"]
        pol_by_app.setdefault(app_id, []).extend(p.get("rule_evaluations", []))
        
    def_by_app = {}
    for d in deficiencies:
        app_id = d["application_id"]
        def_by_app.setdefault(app_id, []).append(d)
        
    exc_by_app = {}
    for e in exceptions:
        app_id = e["application_id"]
        exc_by_app.setdefault(app_id, []).append(e)

    all_apps = set(val_by_app.keys()) | set(pol_by_app.keys()) | set(def_by_app.keys())
    
    engine = EvidenceEngine()
    all_chains = []
    
    for app_id in all_apps:
        app_vals = val_by_app.get(app_id, [])
        app_pols = pol_by_app.get(app_id, [])
        app_defs = def_by_app.get(app_id, [])
        app_excs = exc_by_app.get(app_id, [])
        
        chains = engine.process_application(app_id, app_vals, app_pols, app_defs, app_excs)
        all_chains.extend([c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in chains])
        
    os.makedirs(output_dir, exist_ok=True)
    
    # Flatten evidence records
    all_evidence = []
    for c in all_chains:
        all_evidence.extend(c.get("evidence", []))
        
    ev_path = os.path.join(output_dir, "evidence_records.json")
    with open(ev_path, 'w', encoding='utf-8') as f:
        json.dump(all_evidence, f, indent=2)
        
    exp_path = os.path.join(output_dir, "explanations.json")
    with open(exp_path, 'w', encoding='utf-8') as f:
        json.dump(all_chains, f, indent=2)
        
    print(f"Generated {len(all_chains)} explanation chains and {len(all_evidence)} evidence records across {len(all_apps)} applications.")
    return all_chains
