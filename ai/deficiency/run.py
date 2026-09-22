from ai.deficiency.renderer import run_deficiency_pipeline
import os

if __name__ == "__main__":
    val_file = "dataset/predictions/cross_validation/post_matric/validation_predictions.json"
    pol_file = "dataset/predictions/policy/post_matric/policy_predictions.json"
    out_dir = "dataset/predictions/deficiency/post_matric"
    
    run_deficiency_pipeline(val_file, pol_file, out_dir)
