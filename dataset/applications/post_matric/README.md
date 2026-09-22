# Synthetic Post-Matric Application Dataset

**Purpose**: This directory contains the structured synthetic dataset of 100 Post-Matric Scholarship application scenarios used to test and evaluate the verification logic.

**Policy Grounding**: The dataset is grounded in the `PM-2022` policy extracted from the official Post-Matric guidelines (applicable from 01-04-2022). It is NOT intended to represent the current or complete 2026 policy.

**Synthetic Data Clause**: ALL data in this directory is 100% synthetic. There are no real names, no real Aadhaar numbers, and no actual beneficiary records.

**Components**:
- `applications.json`: Canonical structured records.
- `applications.csv`: Flattened tabular view.
- `scenario_manifest.md`: Explanation of the deliberate test scenario engineered into each application.
- `generate_dataset.py`: Reproducible generator script.
