import json
import argparse
from typing import List, Dict, Any

def evaluate_evidence(predictions_file: str, ground_truth_file: str):
    with open(predictions_file, 'r', encoding='utf-8') as f:
        preds = json.load(f)
        
    with open(ground_truth_file, 'r', encoding='utf-8') as f:
        gt = json.load(f)

    # Note: Predictions file contains ExplanationChains, which wrap the findings and evidence.
    preds_by_app = {}
    for p in preds:
        preds_by_app.setdefault(p["application_id"], []).append(p)
        
    gt_by_app = {}
    for g in gt:
        gt_by_app.setdefault(g["application_id"], []).append(g)

    all_apps = set(preds_by_app.keys()) | set(gt_by_app.keys())
    
    tp = 0
    fp = 0
    fn = 0
    
    evidence_coverage = 0
    rule_coverage = 0
    
    for app in all_apps:
        app_preds = preds_by_app.get(app, [])
        app_gt = gt_by_app.get(app, [])
        
        matched_gt_indices = set()
        
        for p in app_preds:
            best_match_idx = -1
            for g_idx, g in enumerate(app_gt):
                if g_idx in matched_gt_indices:
                    continue
                
                # In GT, rule_id is nested under 'rule'. In Preds, it's also under 'rule'
                g_rule = g.get("rule", {}).get("rule_id")
                p_rule = p.get("rule", {}).get("rule_id") if p.get("rule") else None
                
                if p["finding_type"] == g.get("finding_type") or p_rule == g_rule:
                    best_match_idx = g_idx
                    break
            
            if best_match_idx != -1:
                tp += 1
                matched_gt_indices.add(best_match_idx)
                
                g = app_gt[best_match_idx]
                
                if p.get("evidence"):
                    evidence_coverage += 1
                if p.get("rule"):
                    rule_coverage += 1
            else:
                fp += 1
                
        fn += len(app_gt) - len(matched_gt_indices)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    
    print(f"--- Evidence & Explainability Evaluation ---")
    print(f"Total Applications: {len(all_apps)}")
    
    print("\n[GROUND TRUTH METRICS]")
    print(f"Finding Linkage True Positives: {tp}")
    print(f"Finding Linkage False Positives: {fp}")
    print(f"Finding Linkage False Negatives: {fn}")
    print(f"Finding Linkage Precision: {precision:.3f}")
    print(f"Finding Linkage Recall: {recall:.3f}")
    
    print("\n[STRUCTURAL TRACEABILITY COVERAGE]")
    ev_cov = evidence_coverage / tp if tp > 0 else 0.0
    ru_cov = rule_coverage / tp if tp > 0 else 0.0
    print(f"Evidence Linkage Coverage (on TPs): {ev_cov:.1%}")
    print(f"Policy Rule Linkage Coverage (on TPs): {ru_cov:.1%}")
    
    print("\n[UNSUPPORTED METRICS]")
    print(f"Extraction Confidence Acc: NOT_AVAILABLE (synthetic direct-text baseline)")
    print(f"Verification Run IDs: NOT_AVAILABLE (not in legacy GT)")
    print(f"Cross-document evaluation completeness: NOT_AVAILABLE (legacy GT lacks multi-doc linkage)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--predictions", required=True)
    parser.add_argument("--ground-truth", required=True)
    args = parser.parse_args()
    
    evaluate_evidence(args.predictions, args.ground_truth)
