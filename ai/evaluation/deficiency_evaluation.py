import json
import argparse
from typing import List, Dict, Any

def evaluate_deficiencies(predictions_file: str, ground_truth_file: str):
    with open(predictions_file, 'r', encoding='utf-8') as f:
        preds = json.load(f)
        
    with open(ground_truth_file, 'r', encoding='utf-8') as f:
        gt = json.load(f)

    # Group by app_id
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
    
    severity_match = 0
    severity_mismatch = 0
    severity_mismatch_details = []
    
    category_match = 0
    type_match = 0

    for app in all_apps:
        app_preds = preds_by_app.get(app, [])
        app_gt = gt_by_app.get(app, [])
        
        # We need a stable matching identity. 
        # For simplicity, we'll try to match by deficiency_type and if multiple, by source.
        # Since gt doesn't have category natively in this structure, we'll match by type.
        
        matched_gt_indices = set()
        matched_pred_indices = set()
        
        for p_idx, p in enumerate(app_preds):
            best_match_idx = -1
            for g_idx, g in enumerate(app_gt):
                if g_idx in matched_gt_indices:
                    continue
                # Determine if it's a match.
                # GT has deficiency_type = MISSING_DOCUMENT
                # Prediction has deficiency_type = MISSING_DOCUMENT
                
                # Check rule overlap
                p_rules = set([p.get("rule_id"), p.get("source_id")] )
                g_rules = set(g.get("source_rule_ids", []))
                
                rule_overlap = bool(p_rules.intersection(g_rules))
                
                if p["deficiency_type"] == g.get("deficiency_type") or rule_overlap:
                    best_match_idx = g_idx
                    break
            
            if best_match_idx != -1:
                tp += 1
                matched_gt_indices.add(best_match_idx)
                matched_pred_indices.add(p_idx)
                
                g = app_gt[best_match_idx]
                
                if p["severity"] == g.get("severity"):
                    severity_match += 1
                else:
                    severity_mismatch += 1
                    severity_mismatch_details.append({
                        "app_id": app,
                        "expected": g.get("severity"),
                        "predicted": p["severity"],
                        "type": p["deficiency_type"]
                    })
                    
                if p["deficiency_type"] == g.get("deficiency_type"):
                    type_match += 1
            else:
                fp += 1
                
        # Unmatched GTs are false negatives
        fn += len(app_gt) - len(matched_gt_indices)

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    
    sev_acc = severity_match / tp if tp > 0 else 0.0
    type_acc = type_match / tp if tp > 0 else 0.0
    
    print(f"--- Deficiency Intelligence Evaluation ---")
    print(f"Total Applications: {len(all_apps)}")
    print(f"True Positives: {tp}")
    print(f"False Positives: {fp}")
    print(f"False Negatives: {fn}")
    print(f"Precision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")
    print(f"F1 Score: {f1:.3f}")
    
    print("\n--- Field-Level Agreement (on True Positives) ---")
    print(f"Type Match: {type_match}/{tp} ({type_acc:.1%})")
    print(f"Severity Match: {severity_match}/{tp} ({sev_acc:.1%})")
    
    if severity_mismatch > 0:
        print(f"\nNote: There is a known taxonomy mismatch for severity.")
        print(f"Sample mismatches:")
        for sm in severity_mismatch_details[:5]:
            print(f"  App {sm['app_id']} | Type: {sm['type']} | Expected: {sm['expected']} | Predicted: {sm['predicted']}")
            
    print(f"\nResponsible Party Accuracy: NOT_AVAILABLE (not in GT)")
    print(f"Rerun Scope Accuracy: NOT_AVAILABLE (not in GT)")
    print(f"Exception Classification: NOT_AVAILABLE (not in GT)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--predictions", required=True)
    parser.add_argument("--ground-truth", required=True)
    args = parser.parse_args()
    
    evaluate_deficiencies(args.predictions, args.ground_truth)
