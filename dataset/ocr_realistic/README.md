# Realistic OCR Benchmark

This dataset contains a realistic OCR benchmark designed to evaluate the true production capabilities of the AI pipeline on raster/image-only documents without using any real beneficiary PII.

## Contents
* `documents/`: Contains synthetic raster-based PDFs representing different document types and qualities.
* `ground_truth.json`: Contains the expected field values and quality conditions for each document.

## Generation Methodology
The documents are generated synthetically using Pillow. Real templates and formats are emulated, and values are injected. Then, conditions are applied:
- clean
- rotated_90
- skewed
- faint
- low_res
- noisy
- jpeg_compression
- stamp_interference
- shadows

The resulting images are saved as PDFs to simulate scanned document submissions.
