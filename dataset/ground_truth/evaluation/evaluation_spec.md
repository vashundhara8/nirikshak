# Evaluation Specification

This document defines the evaluation dimensions for the MoTA Scholarship Intelligence & Lifecycle Platform.

## Dimensions

1. **Document classification**: Correctly categorizing uploaded files into expected document types.
2. **OCR**: Optical Character Recognition accuracy (e.g. text extraction without structural mapping).
3. **Field extraction**: Correctly parsing structural fields from raw OCR text.
4. **Normalization**: Standardizing extracted raw text into canonical system formats.
5. **Document presence detection**: Identifying whether an expected document is present or absent.
6. **Cross-document validation**: Comparing identical semantic fields across multiple documents for consistency.
7. **Deficiency detection**: Aggregating missing documents and validation failures into deficiency flags.
8. **Policy evaluation**: Correctly executing the deterministic rule engine over normalized inputs.
9. **Manual-review routing**: Identifying scenarios where policy is ambiguous or state-dependent, routing them to human officers.
10. **Evidence mapping**: Establishing the exact document, page, and field bounding boxes that prove a given value.
11. **Explainability traceability**: Linking values to evidence, to specific policy rules, to the final reasoning.
