# Ollama Local AI Integration

This document describes the integration of the Ollama local AI provider into the MoTA Scholarship Intelligence & Lifecycle Platform.

## 1. Provider Architecture

Ollama is integrated into the `ai/providers/ollama_provider.py` module, which exposes a straightforward interface for text generation. 
The system uses it specifically within `ai/document_intelligence/ollama_extractor.py` as an **optional** step to assist with structured extraction of text that has already been parsed by PDF direct text extraction or PaddleOCR.

The pipeline architecture:
1. **Document Inspection:** Check if embedded text is available.
2. **OCR Engine (PaddleOCR):** Used if rasterized or no text is available.
3. **Ollama Assistance:** If `OLLAMA_ENABLED=true` and the provider is available, Ollama attempts to extract structured JSON data using a strict Pydantic schema (`OllamaExtractionSchema`).
4. **Deterministic Validation & Policy Engine:** The extracted fields are processed strictly by the rules engine.

## 2. Configuration & Local Setup

Ollama must be configured via environment variables in `.env`:

```env
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TEXT_MODEL=llama3:latest
OLLAMA_TIMEOUT=30
```

**Local Development Setup:**
- Install Ollama on your machine.
- Run `ollama run llama3:latest` to ensure the model is pulled and available.
- Start the server (usually running by default on `http://localhost:11434`).

## 3. Model Used

The designated text extraction model is **`llama3:latest`**.
Currently, there is no vision model enabled (e.g., `Qwen2.5-VL`). PaddleOCR handles all visual character recognition tasks before Ollama receives the text.

## 4. Limitations & Fallback Behavior

- **Advisory Only:** If Ollama parsing or validation fails, it attempts one strict retry. If that fails, it falls back to the `RULE_BASELINE` deterministic extraction.
- **Fail Closed for Schema:** Arbitrary natural language is rejected. Only valid JSON matching the schema is passed forward.
- **Availability:** If Ollama is unavailable or disabled, the application starts normally and bypasses LLM extraction seamlessly.

## 5. Governance Boundary (CRITICAL)

**LLM output is advisory extraction/normalization only. Eligibility is determined by the deterministic policy engine. Final decision is made by an authorized officer.**

- **Ollama/LLMs NEVER determine eligibility.**
- **Ollama/LLMs NEVER approve or reject applications.**
- **LLM confidence is not treated as a fraud/risk score.**

## 6. Test Results & Provenance

- **Smoke Test:** Passed using synthetic data, strictly extracting required fields.
- **Unit Tests:** Verified that the pipeline correctly uses Ollama when available and falls back gracefully when disabled/unavailable.
- **Provenance:** Every field extracted by Ollama retains metadata (`provider="ollama"`, `model="llama3:latest"`, `prompt_version="1.0.0"`).
