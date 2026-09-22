# Metrics Specification

This document defines HOW metrics will later be calculated for the MoTA Scholarship Intelligence & Lifecycle Platform.

IMPORTANT: Do NOT calculate metrics yet. Do NOT claim any accuracy. This file only defines the calculation methodology.

## 1. OCR
- **CER** (Character Error Rate): Edit distance between ground truth string and recognized string at the character level.
- **WER** (Word Error Rate): Edit distance at the word level.

## 2. Extraction
- **Precision**: (Correctly extracted fields) / (Total fields extracted)
- **Recall**: (Correctly extracted fields) / (Total fields in ground truth)
- **F1**: 2 * (Precision * Recall) / (Precision + Recall)

## 3. Classification
- **Accuracy**: (Correctly classified documents) / (Total documents)
- **Precision**: True Positives / (True Positives + False Positives) per class
- **Recall**: True Positives / (True Positives + False Negatives) per class
- **F1**: Harmonic mean of Precision and Recall

## 4. Validation
- **Accuracy**: Correct pass/fail decisions across cross-document validation checks.
- **Precision**: (True validation failures found) / (Total validation failures flagged)
- **Recall**: (True validation failures found) / (Actual validation failures in ground truth)
- **F1**: Harmonic mean of Precision and Recall

## 5. Deficiency Detection
- **Precision**: (Valid deficiencies raised) / (Total deficiencies raised)
- **Recall**: (Valid deficiencies raised) / (Actual deficiencies in ground truth)
- **F1**: Harmonic mean of Precision and Recall
- **TPR** (True Positive Rate): Same as Recall
- **FPR** (False Positive Rate): (False deficiencies raised) / (Actual clean cases)

## 6. Policy Engine
- **Determinism**: For identical normalized inputs and identical policy version, the policy evaluation must produce the same result 100% of the time. (This is a system property).
- **Reproducibility**: The ability to replay past decisions deterministically.
- **Rule coverage**: Percentage of applicable policy rules actively evaluated.

## 7. Evidence
- **Evidence mapping accuracy**: Correct linking of extracted values back to their source document locations.
- **Correct source mapping**: Accuracy of the pointer to the exact document.
- **Correct field mapping**: Accuracy of the exact location/field reference.

## 8. Manual Review
- **Correct routing rate**: (Cases correctly sent to manual review) / (Actual ambiguous cases in ground truth)
