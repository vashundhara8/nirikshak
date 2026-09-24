# Real-World OCR Benchmark Validation (Phase B)

## Objective
Validate the NIRIKSHAK OCR pipeline against real-world degradation conditions without using real beneficiary PII.

## Methodology
- **Synthetic Ground Truth**: Generated independent ground truth for 5 document types (`ST_CERTIFICATE`, `INCOME_CERTIFICATE`, `DOMICILE_CERTIFICATE`, `AADHAR`, `MARKSHEET`).
- **Condition Variance**: Applied realistic degradation conditions using `Pillow`, including:
  - Clean Scan
  - 90-degree Rotation
  - Skewed Angle
  - Faint Text
  - Low Resolution Scan
  - Heavy Background Noise
  - JPEG Compression Artifacts
  - Stamp Interference
  - Gradient Shadows
- **Dataset Size**: 45 unique combinations generated.
- **Location**: `dataset/ocr_realistic/`

## Pipeline Architecture Analysis (LLM Independence)
An extensive audit of the pipeline (`pipeline.py` and `field_extractor.py`) was performed:
1. **Fallback Logic**: The `DocumentPipeline` correctly identifies raster-based PDFs using `PDFInspector` and routes them to `OCREngine` (PaddleOCR) when direct text extraction fails.
2. **Deterministic Extraction**: The output text from PaddleOCR is routed through the exact same `DocumentClassifier` and `FieldExtractor`.
3. **No LLM Usage**: The `FieldExtractor` uses strict Regex mapping for known document templates. It is 100% deterministic and does NOT invoke any LLM, ensuring it doesn't hallucinate fields and acts reliably in production environments where LLMs might be slow or unavailable.

## Evaluation Results
The evaluation script `evaluate_realistic_ocr.py` was created to evaluate classification, field exact-match, and document quality performance. 

> **Current Local Limitation**: Local execution on Windows without GPU using PaddleOCR required disabling `enable_mkldnn` to avoid a critical C++ crash (`ConvertPirAttribute2RuntimeAttribute`). However, testing reveals that disabling `enable_mkldnn` on the current environment causes the PaddleOCR model to output completely garbled text (e.g., `'n\na\no\nt\no\ne\ne\ne\ne\ne\ne\ne\ni\ne\ne'`) instead of the actual characters. As a result, the pipeline successfully executes, but `DocumentClassifier` rejects the document as `UNKNOWN` because the recognized text is pure noise. Evaluating all 45 documents currently fails entirely due to this underlying PaddleOCR environment bug.

**Next Steps for Production Eval:**
- Deploy the exact same `evaluate_realistic_ocr.py` script to a Linux-based GPU staging environment where PaddleOCR can run optimized.
- Aggregate metrics and review failure analysis from `dataset/predictions/ocr_realistic/failures.json`.
- The evaluation infrastructure and dataset are now 100% complete and ready.
