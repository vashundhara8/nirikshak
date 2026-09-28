import os
import json

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "dataset", "multilingual")

dirs = [
    "documents/en",
    "documents/hi",
    "documents/or",
    "documents/sat",
    "documents/bn",
    "documents/kn",
    "metadata",
    "ground_truth",
    "source_references",
    "templates",
    "evaluation"
]

for d in dirs:
    os.makedirs(os.path.join(BASE_DIR, d), exist_ok=True)

provenance = [
    {
        "format_reference_id": "REF-OD-INC-01",
        "document_type": "INCOME_CERTIFICATE",
        "source_organization": "Odisha e-District",
        "state": "Odisha",
        "language": "or",
        "script": "Oriya",
        "source_url": "https://edistrict.odisha.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Based on Odisha e-District Form No. III"
    },
    {
        "format_reference_id": "REF-JH-CASTE-01",
        "document_type": "CASTE_CERTIFICATE",
        "source_organization": "Jharkhand JharSewa",
        "state": "Jharkhand",
        "language": "hi",
        "script": "Devanagari",
        "source_url": "https://jharsewa.jharkhand.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Based on Jharkhand JharSewa digital output"
    },
    {
        "format_reference_id": "REF-KA-INC-01",
        "document_type": "INCOME_CERTIFICATE",
        "source_organization": "Karnataka Nadakacheri",
        "state": "Karnataka",
        "language": "kn",
        "script": "Kannada",
        "source_url": "https://nadakacheri.karnataka.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Based on Karnataka Nadakacheri standard format"
    },
    {
        "format_reference_id": "REF-WB-DOM-01",
        "document_type": "DOMICILE_CERTIFICATE",
        "source_organization": "West Bengal e-District",
        "state": "West Bengal",
        "language": "bn",
        "script": "Bengali",
        "source_url": "https://edistrict.wb.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Based on WB e-District format"
    },
    {
        "format_reference_id": "REF-SAT-BON-01",
        "document_type": "BONAFIDE_CERTIFICATE",
        "source_organization": "Tribal Welfare Department",
        "state": "Jharkhand",
        "language": "sat",
        "script": "Ol Chiki",
        "source_url": "https://jharsewa.jharkhand.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Synthetic standard format designed for Ol Chiki OCR testing"
    },
    {
        "format_reference_id": "REF-EN-MARK-01",
        "document_type": "MARKSHEET",
        "source_organization": "CBSE/State Board",
        "state": "National",
        "language": "en",
        "script": "Latin",
        "source_url": "https://www.cbse.gov.in/",
        "accessed_at": "2026-09-26",
        "source_type": "official_government",
        "usage_notes": "Standard English Marksheet"
    }
]

with open(os.path.join(BASE_DIR, "metadata", "provenance.json"), "w", encoding="utf-8") as f:
    json.dump(provenance, f, indent=2, ensure_ascii=False)

print("Directories created and provenance.json written.")
