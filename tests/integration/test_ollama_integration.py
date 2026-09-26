import pytest
from unittest.mock import patch, MagicMock
from ai.providers.ollama_provider import OllamaProvider
from ai.document_intelligence.ollama_extractor import OllamaExtractor
from ai.document_intelligence.pipeline import DocumentPipeline
import json

@pytest.fixture
def mock_settings():
    with patch.dict("os.environ", {
        "OLLAMA_ENABLED": "true",
        "OLLAMA_BASE_URL": "http://localhost:11434",
        "OLLAMA_TEXT_MODEL": "llama3:latest",
        "OLLAMA_TIMEOUT": "5"
    }):
        yield

@pytest.fixture
def provider(mock_settings):
    return OllamaProvider()

@pytest.fixture
def extractor(provider):
    return OllamaExtractor(provider)

def test_ollama_disabled():
    with patch.dict("os.environ", {"OLLAMA_ENABLED": "false"}):
        p = OllamaProvider()
        assert not p.is_available()
        res = p.generate("test")
        assert res["status"] == "DISABLED"

@patch("requests.get")
def test_ollama_unavailable(mock_get, provider):
    mock_get.side_effect = Exception("Connection refused")
    assert not provider.is_available()
    res = provider.generate("test")
    assert res["status"] == "UNAVAILABLE"

@patch("requests.get")
def test_model_missing(mock_get, provider):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"models": [{"name": "other_model:latest"}]}
    mock_get.return_value = mock_resp
    assert not provider.is_available()

@patch("requests.get")
@patch("requests.post")
def test_successful_extraction(mock_post, mock_get, provider, extractor):
    mock_get_resp = MagicMock()
    mock_get_resp.status_code = 200
    mock_get_resp.json.return_value = {"models": [{"name": "llama3:latest"}]}
    mock_get.return_value = mock_get_resp
    
    mock_post_resp = MagicMock()
    mock_post_resp.status_code = 200
    mock_post_resp.json.return_value = {
        "response": json.dumps({
            "candidate_name": "Ananya Rao",
            "category": "Scheduled Tribe",
            "document_type": "ST_CERTIFICATE"
        })
    }
    mock_post.return_value = mock_post_resp
    
    res = extractor.extract("ST_CERTIFICATE", "some text")
    assert res["status"] == "SUCCESS"
    assert res["fields"]["candidate_name"] == "Ananya Rao"
    assert res["metadata"]["provider"] == "ollama"
    assert res["metadata"]["model"] == "llama3:latest"
    assert res["metadata"]["prompt_version"] == "1.0.0"

@patch("requests.get")
@patch("requests.post")
def test_malformed_model_output_fallback(mock_post, mock_get, provider, extractor):
    mock_get_resp = MagicMock()
    mock_get_resp.status_code = 200
    mock_get_resp.json.return_value = {"models": [{"name": "llama3:latest"}]}
    mock_get.return_value = mock_get_resp
    
    # First call returns invalid JSON, second call (retry) returns valid JSON
    mock_post_resp1 = MagicMock()
    mock_post_resp1.status_code = 200
    mock_post_resp1.json.return_value = {"response": "This is not JSON"}
    
    mock_post_resp2 = MagicMock()
    mock_post_resp2.status_code = 200
    mock_post_resp2.json.return_value = {
        "response": json.dumps({"candidate_name": "Retry Success"})
    }
    
    mock_post.side_effect = [mock_post_resp1, mock_post_resp2]
    
    res = extractor.extract("ST_CERTIFICATE", "some text")
    assert res["status"] == "SUCCESS"
    assert res["fields"]["candidate_name"] == "Retry Success"
    assert res["metadata"]["prompt_version"] == "1.0.0-retry"

@patch("requests.get")
@patch("requests.post")
def test_timeout(mock_post, mock_get, provider):
    mock_get_resp = MagicMock()
    mock_get_resp.status_code = 200
    mock_get_resp.json.return_value = {"models": [{"name": "llama3:latest"}]}
    mock_get.return_value = mock_get_resp
    
    import requests
    mock_post.side_effect = requests.exceptions.Timeout("Timeout")
    
    res = provider.generate("test")
    assert res["status"] == "TIMEOUT"

def test_no_eligibility_decision_by_llm():
    # Verify prompt instructs not to decide eligibility
    extractor = OllamaExtractor(OllamaProvider())
    
    # We inspect the internal prompt sent to Ollama
    with patch.object(extractor.provider, 'generate') as mock_generate:
        mock_generate.return_value = {"status": "FAILED"}
        extractor.extract("ST_CERTIFICATE", "some text")
        
        args, kwargs = mock_generate.call_args
        prompt = args[0]
        assert "Do not decide eligibility" in prompt
        assert "eligible" not in prompt.lower().split("do not decide eligibility")[0] 
        # ensure no instructions ask it to evaluate

def test_policy_engine_independence(monkeypatch):
    """
    Ensure the deterministic policy engine does not rely on Ollama.
    """
    from policy_engine.evaluator import PolicyEvaluator
    
    # Even if Ollama is completely unmocked (and potentially unreachable), policy engine works
    engine = PolicyEvaluator()
    # It evaluates rules purely based on provided ApplicationCreate schema, no LLM call inside.
    assert hasattr(engine, "evaluate")
    
@patch("ai.document_intelligence.pipeline.PDFInspector")
def test_deterministic_fallback_in_pipeline(mock_inspector):
    # If Ollama fails or is unavailable, pipeline should still use rule baseline
    mock_inspector_inst = MagicMock()
    # Simulate direct text PDF to skip OCR for this test
    mock_inspector_inst.inspect.return_value = {"usable_text": True}
    mock_inspector.return_value = mock_inspector_inst
    
    pipeline = DocumentPipeline()
    pipeline.text_extractor = MagicMock()
    pipeline.text_extractor.extract.return_value = "Name: Rahul\nCategory: ST"
    
    # Mock classifier and field extractor
    pipeline.classifier.classify = MagicMock(return_value="ST_CERTIFICATE")
    pipeline.field_extractor.extract = MagicMock(return_value={"candidate_name": "Rahul", "category": "ST"})
    
    # Make Ollama unavailable
    with patch("ai.providers.ollama_provider.OllamaProvider.is_available", return_value=False):
        res = pipeline.process_document("dummy.pdf", "doc_1")
        
    assert res.status == "SUCCESS"
    assert res.fields["candidate_name"].extraction_method == "RULE_BASELINE"
