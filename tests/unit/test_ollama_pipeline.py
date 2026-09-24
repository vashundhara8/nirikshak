import pytest
from unittest.mock import patch, MagicMock
from ai.document_intelligence.pipeline import DocumentPipeline
from ai.document_intelligence.ollama_extractor import OllamaExtractor
from ai.providers.ollama_provider import OllamaProvider

@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
@patch('ai.providers.ollama_provider.OllamaProvider.generate')
def test_pipeline_uses_ollama_if_available(mock_generate, mock_is_available, mock_classify, mock_extract, mock_inspect):
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
    
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-123")
    
    assert result.status == "SUCCESS"
    assert result.fields["candidate_name"].raw_value == "Test User"
    assert result.fields["candidate_name"].extraction_method == "OLLAMA_ASSISTED"
    assert result.fields["income"].raw_value == "50000"
    assert "Ollama." in result.notes

@patch('ai.document_intelligence.pdf_inspector.PDFInspector.inspect')
@patch('ai.document_intelligence.text_extractor.TextExtractor.extract')
@patch('ai.document_intelligence.classifier.DocumentClassifier.classify')
@patch('ai.providers.ollama_provider.OllamaProvider.is_available')
def test_pipeline_fallback_if_ollama_unavailable(mock_is_available, mock_classify, mock_extract, mock_inspect):
    mock_inspect.return_value = {"usable_text": True}
    mock_extract.return_value = "Synthetic document text with Name: Fallback User"
    mock_classify.return_value = "INCOME_CERTIFICATE"
    mock_is_available.return_value = False
    
    pipeline = DocumentPipeline()
    result = pipeline.process_document("test.pdf", "doc-123")
    
    assert result.status == "SUCCESS"
    # Assuming baseline rule extraction extracts this, or at least the method isn't ollama
    for k, field in result.fields.items():
        assert field.extraction_method == "RULE_BASELINE"
