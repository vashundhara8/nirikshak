import json
from collections import defaultdict

def reconcile_fps():
    with open('dataset/predictions/deficiency/post_matric/deficiency_predictions.json', 'r', encoding='utf-8') as f:
        preds = json.load(f)
        
    with open('dataset/ground_truth/post_matric/deficiency_ground_truth.json', 'r', encoding='utf-8') as f:
        gt = json.load(f)
        
    with open('dataset/predictions/cross_validation/post_matric/validation_predictions.json', 'r', encoding='utf-8') as f:
        vals = json.load(f)
        
    with open('dataset/predictions/policy/post_matric/policy_predictions.json', 'r', encoding='utf-8') as f:
        pols = json.load(f)

    # Group GT by app_id
    gt_by_app = defaultdict(list)
    for g in gt:
        gt_by_app[g["application_id"]].append(g)
        
    # Build UPSTREAM evidence index
    upstream_by_app = defaultdict(list)
    for v in vals:
        if v.get('status') == 'FAIL':
            upstream_by_app[v['application_id']].append({
                "type": "VALIDATION",
                "id": v['validation_type'],
                "status": v['status'],
                "reason": v.get('reason', '')
            })
            
    for p in pols:
        app_id = p['application_id']
        for r in p.get('rule_evaluations', []):
            if r.get('status') in ['FAIL', 'MANUAL_REVIEW_REQUIRED']:
                upstream_by_app[app_id].append({
                    "type": "POLICY",
                    "id": r['rule_id'],
                    "status": r['status'],
                    "reason": r.get('reason', '')
                })

    tp_indices = set()
    fp_records = []
    
    # Match TPs exactly as in evaluation script
    for p_idx, p in enumerate(preds):
        app = p['application_id']
        app_gt = gt_by_app.get(app, [])
        
        best_match_idx = -1
        for g_idx, g in enumerate(app_gt):
            if (app, g_idx) in tp_indices:
                continue
            
            p_rules = {p.get("rule_id"), p.get("source_id")}
            g_rules = set(g.get("source_rule_ids", []))
            rule_overlap = bool(p_rules.intersection(g_rules))
            
            if p["deficiency_type"] == g.get("deficiency_type") or rule_overlap:
                best_match_idx = g_idx
                break
                
        if best_match_idx != -1:
            tp_indices.add((app, best_match_idx))
        else:
            fp_records.append(p)
            
    print(f"Total Preds: {len(preds)}, TPs: {len(tp_indices)}, FPs to reconcile: {len(fp_records)}")

    # Classify FPs
    classification_counts = {
        "A. TRUE_FALSE_POSITIVE": 0,
        "B. VALID_UNLABELED_FINDING": 0,
        "C. DUPLICATE_OR_REDUNDANT_FINDING": 0,
        "D. CLASSIFICATION_ERROR": 0,
        "E. EXCEPTION_MAPPING_ERROR": 0
    }
    
    table_rows = []
    
    # Track which upstream findings have been consumed by a deficiency to detect duplicates
    consumed_upstream = set()
    
    for p in fp_records:
        app = p['application_id']
        source_id = p['source_id']
        p_type = p['deficiency_type']
        p_cat = p['category']
        
        # Find upstream support
        upstream_support = None
        for u in upstream_by_app.get(app, []):
            if u['id'] == source_id:
                upstream_support = u
                break
                
        reconciliation_class = ""
        reason = ""
        
        if not upstream_support:
            reconciliation_class = "A. TRUE_FALSE_POSITIVE"
            reason = f"No FAIL/MANUAL_REVIEW upstream finding for {source_id}"
        else:
            u_status = upstream_support['status']
            u_id = upstream_support['id']
            # Check if this upstream has already been claimed by another prediction (including TPs or other FPs)
            # Actually, `engine.py` creates one deficiency per validation failure or policy failure, so duplicates 
            # would mean we have a bug in engine, or multiple rules trigger the exact same semantic issue.
            
            # Implementation error check: Should MANUAL_REVIEW_REQUIRED have been an Exception?
            if u_status == 'MANUAL_REVIEW_REQUIRED' and "DOC" not in u_id:
                # Wait, engine currently only allows DOC to be deficiency if MANUAL_REVIEW_REQUIRED.
                # So if DOC is here, is it an Exception mapping error or valid unlabeled?
                pass
                
            # Wait, engine processes validations. All validations are FAIL.
            # If it's a NAME_CONSISTENCY, it's not in GT. So it's VALID_UNLABELED_FINDING.
            if u_status == 'FAIL' or (u_status == 'MANUAL_REVIEW_REQUIRED' and "DOC" in u_id):
                # Is it duplicate?
                sig = f"{app}_{u_id}"
                if sig in consumed_upstream:
                    reconciliation_class = "C. DUPLICATE_OR_REDUNDANT_FINDING"
                    reason = "Upstream finding already mapped"
                else:
                    reconciliation_class = "B. VALID_UNLABELED_FINDING"
                    reason = "Valid finding from Step 11/12 not present in narrow GT"
                    consumed_upstream.add(sig)
            elif u_status == 'MANUAL_REVIEW_REQUIRED':
                reconciliation_class = "E. EXCEPTION_MAPPING_ERROR"
                reason = "Should have been mapped to an exception, not a deficiency"
                
        classification_counts[reconciliation_class] += 1
        
        table_rows.append(
            f"| {app} | {p['source_type']} | {source_id} | {p_type} ({p_cat}) | NOT IN GT | {reconciliation_class.split('.')[0].strip()} | {reason} |"
        )
        
    md_content = f"""# Step 13 FP Reconciliation Audit

## Summary Counts
- **Total False Positives Analyzed**: {len(fp_records)}

- **TRUE_FALSE_POSITIVE**: {classification_counts['A. TRUE_FALSE_POSITIVE']}
- **VALID_UNLABELED_FINDING**: {classification_counts['B. VALID_UNLABELED_FINDING']}
- **DUPLICATE_OR_REDUNDANT_FINDING**: {classification_counts['C. DUPLICATE_OR_REDUNDANT_FINDING']}
- **CLASSIFICATION_ERROR**: {classification_counts['D. CLASSIFICATION_ERROR']}
- **EXCEPTION_MAPPING_ERROR**: {classification_counts['E. EXCEPTION_MAPPING_ERROR']}

## Detailed Audit Table

| Application ID | Upstream Source | Upstream Rule/Finding | Step 13 Output | Legacy GT Status | Reconciliation Class | Reason |
|---|---|---|---|---|---|---|
"""
    md_content += "\n".join(table_rows)
    
    with open('docs/STEP13_FP_RECONCILIATION.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    for k,v in classification_counts.items():
        print(f"{k}: {v}")
        
if __name__ == '__main__':
    reconcile_fps()
