# Real Data Foundation & Public Data Integration

## 1. Why real public data is used
While the synthetic benchmark (SIH 2026 dataset) rigorously controls logic rules, validation metrics, and dataset edge cases, it operates in a closed system. Integrating authoritative real-world statistics grounds the intelligence layer in actual scale and schemas.

## 2. Why individual beneficiary PII is NOT required
Our focus is on the intelligence engine logic, cross-document verification, and policy extraction. Aggregate government datasets (e.g., funds released, beneficiaries by state/district) are sufficient to test system volume and real-world classifications without requiring or exposing Personally Identifiable Information (PII).

## 3. Public vs Synthetic vs Sandbox Data
- **REAL_REFERENCE_DATA**: Official Open Government Data.
- **SYNTHETIC_BENCHMARK**: Controlled 100-application dataset. Never modified by or mixed with real data.
- **SANDBOX_INTEGRATIONS**: Stubbed/Mock adapters for future endpoints (e.g. API Setu) running in a sandbox context.
- **TEST_FIXTURE**: Mock fallbacks explicitly created for integration/unit testing of the ingestion layer.

## 4. Sources
- Open Government Data (data.gov.in) Post-Matric Scholarship statistics.
- National Scholarship Portal (NSP) Institution Search (currently pending machine-readable access due to CAPTCHA restrictions).

## 5. Access requirements
- For `data.gov.in` OGD, an API key is required (`DATA_GOV_API_KEY`).
- For API Setu, explicit Sandbox credentials (`APISETU_API_KEY`) are required.

## 6. API-key setup
Define the following in `.env`:
```
DATA_GOV_API_KEY=your_actual_key_here
```
The ingestion process will fail clearly if the key is missing. No mock fallback is used in production ingestion.

## 7. Ingestion workflow
```bash
python -m data_ingestion.ingest --source post_matric_statistics
```
This fetches from the OGD API, caches the raw response, validates the schema, and saves normalized data with provenance wrappers.

## 8. Provenance
Every ingested record retains the source ID, UUID, and retrieved timestamp ensuring zero data lineage loss.

## 9. Data security
- API Keys are exclusively read from `.env` (which is in `.gitignore`).
- No PII is ingested.
- The pipeline degrades gracefully on access denial.

## 10. Limitations
- Institutional data currently relies on the public NSP website, which is CAPTCHA protected. Automated ingestion for this domain is blocked.

## 11. Future authorized integrations
The adapter structure built in `integrations/providers/` enables future production connections (DBT, PFMS, API Setu) once mutual TLS / credentials are authenticated.

> The system currently uses public aggregate/reference government data and synthetic beneficiary/document data. It does not claim access to restricted NSP/MoTA beneficiary records.
