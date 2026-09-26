"""
tests/unit/test_ollama_pipeline.py

Tests for DocumentPipeline Ollama isolation (Phase 1.2 — Task 1).

Root cause fixed: OCREngine previously called PaddleOCR(...) in __init__,
which blocks on model downloads and network I/O even when tests mock public
methods. The fix makes OCREngine lazy — PaddleOCR is only initialized on the
first call to extract().

This means:
  - DocumentPipeline() construction is zero-I/O
  - OllamaProvider.is_available() is only called inside process_document()
    when the doc_type is known (already the case from Phase 1 code)
  - All existing Ollama-assisted and fallback behaviour is preserved

Required tests (Phase 1.2 Task 1):
  1. DocumentPipeline instantiates without Ollama running
  2. Ollama-assisted extraction works when Ollama is available
  3. Ollama failure falls back to rule-baseline deterministically
  4. No network call occurs merely from instantiating DocumentPipeline

Existing tests preserved:
  - test_pipeline_uses_ollama_if_available (renamed, same logic)
  - test_pipeline_fallback_if_ollama_unavailable (renamed, same logic)
"""
import pytest
from unittest.mock import patch, MagicMock, call


# ---------------------------------------------------------------------------
# Required Test 1 — Construction is zero-I/O
# ---------------------------------------------------------------------------

def test_pipeline_instantiation_does_not_perform_network_io():
    """
    DocumentPipeline() must complete without any network call, even if
    Ollama is unavailable and PaddleOCR is not installed.
    Validates that OCREngine no longer eagerly initializes PaddleOCR.
    """
    import socket

    original_connect = socket.socket.connect

    def fail_on_connect(self, address):
        raise AssertionError(
            f"DocumentPipeline.__init__ made an unexpected network call to {address}. "
            "Construction must be zero-I/O."
        )

    with patch.object(socket.socket, "connect", fail_on_connect):
        # This must not raise — no network call during construction
        from ai.document_intelligence.pipeline import DocumentPipeline
        pipeline = DocumentPipeline()

    assert pipeline is not None


def test_pipeline_can_instantiate_without_paddleocr():
    """
    DocumentPipeline() must not raise even when PaddleOCR is not installed.
    The lazy-init means ImportError only surfaces when extract() is actually called.
    """
    import sys
    # Remove paddleocr from sys.modules to simulate it not being installed
    saved = sys.modules.pop("paddleocr", None)
    try:
        from ai.document_intelligence.pipeline import DocumentPipeline
        pipeline = DocumentPipeline()   # must not raise ImportError
        assert pipeline is not None
        # OCR engine should report unavailable (not initialized yet)
        assert pipeline.ocr_engine.available is False
    finally:
        if saved is not None:
            sys.modules["paddleocr"] = saved


def test_ocr_engine_init_does_not_call_paddleocr():
    """
    Constructing OCREngine must not call PaddleOCR(). The call must only
    happen inside extract() via _ensure_initialized().
    """
    import sys
    # Ensure paddleocr is not accidentally loaded from a previous test
    with patch.dict("sys.modules", {"paddleocr": None}):
        from ai.document_intelligence.ocr_engine import OCREngine
        engine = OCREngine()
        # PaddleOCR constructor must NOT have been called at init time
        assert engine._initialized is False
        assert engine.engine is None


# ---------------------------------------------------------------------------
# Required Test 4 — No network call on instantiation (explicit socket-level)
# ---------------------------------------------------------------------------

def test_ocr_engine_lazy_init_deferred_to_extract():
    """
    Calling OCREngine() sets _initialized=False.
    _ensure_initialized() is only triggered by extract(), not __init__.
    """
    from ai.document_intelligence.ocr_engine import OCREngine
    engine = OCREngine()
    assert engine._initialized is False, "OCREngine must not auto-initialize on construction"
    assert engine._available is False
    assert engine.engine is None


# ---------------------------------------------------------------------------
# Required Test 2 — Ollama-assisted extraction works when available
# (preserved from original test_ollama_pipeline.py)
# ---------------------------------------------------------------------------

@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
@patch('ai.providers.ollama_provider.OllamaProvider.generate')
def test_pipeline_uses_ollama_if_available(
    mock_generate, mock_is_available, mock_classify, mock_extract, mock_inspect
):
    """
    When OllamaProvider.is_available() returns True and generate() succeeds,
    extraction_method must be OLLAMA_ASSISTED for extracted fields.
    """
    mock_inspect.return_value = {"usable_text": True}
    mock_extract.return_value = "Synthetic document text..."
    mock_classify.return_value = "INCOME_CERTIFICATE"
    mock_is_available.return_value = True

    mock_generate.return_value = {
        "status": "SUCCESS",
        "response": '{"candidate_name": "Test User", "income": "50000"}',
        "provider": "ollama",
        "model": "llama3:latest"
    }

    from ai.document_intelligence.pipeline import DocumentPipeline
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-123")

    assert result.status == "SUCCESS"
    assert result.fields["candidate_name"].raw_value == "Test User"
    assert result.fields["candidate_name"].extraction_method == "OLLAMA_ASSISTED"
    assert result.fields["income"].raw_value == "50000"
    assert "Ollama." in result.notes


# ---------------------------------------------------------------------------
# Required Test 3 — Ollama failure falls back deterministically
# (preserved from original test_ollama_pipeline.py)
# ---------------------------------------------------------------------------

@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
def test_pipeline_fallback_if_ollama_unavailable(
    mock_is_available, mock_classify, mock_extract, mock_inspect
):
    """
    When OllamaProvider.is_available() returns False, the pipeline must fall
    back to RULE_BASELINE deterministically — no Ollama calls made.
    """
    mock_inspect.return_value = {"usable_text": True}
    mock_extract.return_value = "Synthetic document text with Name: Fallback User"
    mock_classify.return_value = "INCOME_CERTIFICATE"
    mock_is_available.return_value = False

    from ai.document_intelligence.pipeline import DocumentPipeline
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-123")

    assert result.status == "SUCCESS"
    for k, field in result.fields.items():
        assert field.extraction_method == "RULE_BASELINE", (
            f"Field '{k}' should be RULE_BASELINE when Ollama is unavailable, "
            f"got '{field.extraction_method}'"
        )


@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
@patch('ai.providers.ollama_provider.OllamaProvider.generate')
def test_pipeline_fallback_if_ollama_fails_mid_extraction(
    mock_generate, mock_is_available, mock_classify, mock_extract, mock_inspect
):
    """
    When is_available() is True but generate() returns a non-SUCCESS status,
    the pipeline must fall back to RULE_BASELINE — not crash or partially use Ollama output.
    """
    mock_inspect.return_value = {"usable_text": True}
    mock_extract.return_value = "Applicant Name: Test Fallback\nAnnual Family Income: 80000"
    mock_classify.return_value = "INCOME_CERTIFICATE"
    mock_is_available.return_value = True
    mock_generate.return_value = {
        "status": "TIMEOUT",
        "error": "Request timed out"
    }

    from ai.document_intelligence.pipeline import DocumentPipeline
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-fallback")

    assert result.status == "SUCCESS"
    # All fields must be RULE_BASELINE since Ollama failed
    for k, field in result.fields.items():
        assert field.extraction_method == "RULE_BASELINE", (
            f"Field '{k}' must fall back to RULE_BASELINE on Ollama timeout"
        )
    assert "Fallback" in result.notes or "fallback" in result.notes.lower()


@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
def test_no_ollama_call_when_doc_type_unknown(
    mock_is_available, mock_classify, mock_extract, mock_inspect
):
    """
    When the document type is UNKNOWN, OllamaProvider.is_available() must
    NOT be called — no point querying Ollama for an unclassified document.
    """
    mock_inspect.return_value = {"usable_text": True}
    mock_extract.return_value = "some unclassifiable text"
    mock_classify.return_value = "UNKNOWN"

    from ai.document_intelligence.pipeline import DocumentPipeline
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-unknown")

    assert result.status == "FAILED"
    mock_is_available.assert_not_called()
