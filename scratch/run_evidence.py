from ai.evidence.renderer import run_evidence_pipeline

if __name__ == "__main__":
    val_file = "dataset/predictions/cross_validation/post_matric/validation_predictions.json"
    pol_file = "dataset/predictions/policy/post_matric/policy_predictions.json"
    def_file = "dataset/predictions/deficiency/post_matric/deficiency_predictions.json"
    exc_file = "dataset/predictions/deficiency/post_matric/deficiency_summary.json"
    out_dir = "dataset/predictions/evidence/post_matric"
    
    run_evidence_pipeline(val_file, pol_file, def_file, exc_file, out_dir)
