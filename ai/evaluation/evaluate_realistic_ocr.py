import os
import json
import sys
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from document_intelligence.pipeline import DocumentPipeline
from evaluation.metrics import MetricsCalculator

def evaluate():
    docs_gt_path = "dataset/ocr_realistic/ground_truth.json"
    if not os.path.exists(docs_gt_path):
        print("Ground truth not found!")
        return

    with open(docs_gt_path, 'r') as f:
        docs_gt = json.load(f)

    pipeline = DocumentPipeline()
    metrics = MetricsCalculator()

    results = {
        "processed": 0,
        "success": 0,
        "failed": 0,
        "methods": {},
        "classification": {"tp": 0, "fp": 0, "fn": 0},
        "extraction": {"tp": 0, "fp": 0, "fn": 0},
        "quality": {},
        "doc_types": {},
        "failures": [],
        "fields": {}
    }

    out_dir = "dataset/predictions/ocr_realistic"
    os.makedirs(out_dir, exist_ok=True)
    predictions = []

    for gt in docs_gt:
        doc_id = gt['document_id']
        app_id = gt['application_id']
        filename = doc_id + ".pdf"
        filepath = os.path.join("dataset/ocr_realistic/documents", app_id, filename)

        if not os.path.exists(filepath):
            continue

        try:
            result = pipeline.process_document(filepath, doc_id, app_id)
        except Exception as e:
            traceback.print_exc()
            results["failed"] += 1
            results["failures"].append({"doc_id": doc_id, "error": str(e), "cause": "pipeline routing"})
            continue
        
        predictions.append(result.__dict__)

        results["processed"] += 1
        if result.status == "SUCCESS":
            results["success"] += 1
        else:
            results["failed"] += 1

        ext_method = result.extraction_method
        results["methods"][ext_method] = results["methods"].get(ext_method, 0) + 1

        # Classification eval
        if result.document_type == gt['document_type']:
            results["classification"]["tp"] += 1
        else:
            results["classification"]["fp"] += 1
            results["classification"]["fn"] += 1
            results["failures"].append({"doc_id": doc_id, "error": f"Expected {gt['document_type']}, got {result.document_type}", "cause": "OCR recognition/preprocessing"})

        doc_type = gt['document_type']
        if doc_type not in results["doc_types"]:
            results["doc_types"][doc_type] = {"tp": 0, "fp": 0, "fn": 0}
            
        if result.document_type == gt['document_type']:
            results["doc_types"][doc_type]["tp"] += 1
        else:
            results["doc_types"][doc_type]["fp"] += 1
            results["doc_types"][doc_type]["fn"] += 1

        # Quality eval
        q = gt['expected_quality']
        if q not in results["quality"]:
            results["quality"][q] = {"tp": 0, "fp": 0, "fn": 0}
            
        if result.document_type == gt['document_type']:
            results["quality"][q]["tp"] += 1
        else:
            results["quality"][q]["fp"] += 1
            results["quality"][q]["fn"] += 1

        # Field eval
        for field_gt in gt['expected_field_values']:
            fname = field_gt['field_name']
            expected = field_gt['normalized_expected_value']
            
            if fname not in results["fields"]:
                results["fields"][fname] = {"tp": 0, "fp": 0, "fn": 0}
            
            if fname in result.fields:
                pred = result.fields[fname].normalized_value
                if metrics.exact_match(pred, expected):
                    results["extraction"]["tp"] += 1
                    results["fields"][fname]["tp"] += 1
                else:
                    results["extraction"]["fp"] += 1
                    results["fields"][fname]["fp"] += 1
                    results["failures"].append({"doc_id": doc_id, "field": fname, "error": f"Expected {expected}, got {pred}", "cause": "field extraction"})
            else:
                results["extraction"]["fn"] += 1
                results["fields"][fname]["fn"] += 1
                results["failures"].append({"doc_id": doc_id, "field": fname, "error": f"Field not extracted", "cause": "field extraction/OCR recognition"})

    # Write predictions
    with open(os.path.join(out_dir, "predictions.json"), "w") as f:
        # Convert Pydantic objects to dicts
        out_preds = []
        for p in predictions:
            if hasattr(p, "dict"):
                out_preds.append(p.dict())
            else:
                d = {}
                for k,v in p.items():
                    if k == "fields":
                        d[k] = {fk: fv.__dict__ for fk, fv in v.items()}
                    else:
                        d[k] = v
                out_preds.append(d)
        json.dump(out_preds, f, indent=4)

    # Output metrics
    c_p, c_r, c_f1 = metrics.precision_recall_f1(**results["classification"])
    e_p, e_r, e_f1 = metrics.precision_recall_f1(**results["extraction"])
    
    print("STEP 10 \u2014 REAL WORLD OCR BENCHMARK COMPLETE")
    print(f"\nDocuments processed: {results['processed']}")
    print(f"Documents successfully processed: {results['success']}")
    print(f"Documents failed: {results['failed']}")
    
    print("\nExtraction Methods used:")
    for m, c in results["methods"].items():
        print(f"  {m}: {c}")
    
    print("\nClassification results:")
    print(f"Precision: {c_p:.2f}, Recall: {c_r:.2f}, F1: {c_f1:.2f}")
    
    print("\nField extraction results:")
    print(f"Precision: {e_p:.2f}, Recall: {e_r:.2f}, F1: {e_f1:.2f}")
    
    exact_match = results["extraction"]["tp"] / (results["extraction"]["tp"] + results["extraction"]["fp"] + results["extraction"]["fn"]) if (results["extraction"]["tp"] + results["extraction"]["fp"] + results["extraction"]["fn"]) > 0 else 0
    print(f"Exact match rate: {exact_match:.2f}")
    
    print("\nPerformance by document type:")
    for dt, dt_res in results["doc_types"].items():
        p, r, f1 = metrics.precision_recall_f1(**dt_res)
        print(f"  {dt}: F1 {f1:.2f}")
        
    print("\nPerformance by quality condition:")
    for q, q_res in results["quality"].items():
        p, r, f1 = metrics.precision_recall_f1(**q_res)
        print(f"  {q} performance: F1 {f1:.2f}")
        
    print("\nPerformance by field:")
    for f, f_res in results["fields"].items():
        p, r, f1 = metrics.precision_recall_f1(**f_res)
        print(f"  {f}: F1 {f1:.2f}")
        
    print("\nFailures:")
    failure_causes = {}
    for fail in results["failures"]:
        cause = fail.get("cause", "unknown")
        failure_causes[cause] = failure_causes.get(cause, 0) + 1
        
    for cause, count in failure_causes.items():
        print(f"  {cause}: {count}")
        
    with open(os.path.join(out_dir, "failures.json"), "w") as f:
        json.dump(results["failures"], f, indent=4)

if __name__ == "__main__":
    evaluate()
