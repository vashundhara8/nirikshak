"""
tests/unit/test_ollama_provider_import.py

Verifies that ai.providers.ollama_provider can be imported and instantiated
from any Python execution context without requiring the backend package on
sys.path (P0-04 fix).
"""
import importlib
import os


def test_ollama_provider_importable():
    """Module must import successfully without backend.app on sys.path."""
    mod = importlib.import_module("ai.providers.ollama_provider")
    assert hasattr(mod, "OllamaProvider"), "OllamaProvider class must exist"


def test_ollama_provider_reads_env_vars(monkeypatch):
    """OllamaProvider must read configuration from env vars, not settings singleton."""
    monkeypatch.setenv("OLLAMA_ENABLED", "true")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://test-host:11434")
    monkeypatch.setenv("OLLAMA_TEXT_MODEL", "test-model:latest")
    monkeypatch.setenv("OLLAMA_TIMEOUT", "60")

    # Re-import to pick up fresh env
    import importlib
    import ai.providers.ollama_provider as mod
    importlib.reload(mod)

    provider = mod.OllamaProvider()
    assert provider.enabled is True
    assert provider.base_url == "http://test-host:11434"
    assert provider.model == "test-model:latest"
    assert provider.timeout == 60


def test_ollama_provider_disabled_by_default(monkeypatch):
    """When OLLAMA_ENABLED is absent, provider must default to disabled."""
    monkeypatch.delenv("OLLAMA_ENABLED", raising=False)

    import importlib
    import ai.providers.ollama_provider as mod
    importlib.reload(mod)

    provider = mod.OllamaProvider()
    assert provider.enabled is False


def test_ollama_provider_disabled_returns_disabled_status(monkeypatch):
    """generate() must return DISABLED status when provider is not enabled."""
    monkeypatch.setenv("OLLAMA_ENABLED", "false")

    import importlib
    import ai.providers.ollama_provider as mod
    importlib.reload(mod)

    provider = mod.OllamaProvider()
    result = provider.generate("test prompt")
    assert result["status"] == "DISABLED"


def test_ollama_extractor_importable():
    """OllamaExtractor must also be importable without backend on sys.path."""
    import ai.document_intelligence.ollama_extractor as extractor_mod  # noqa: F401
    assert hasattr(extractor_mod, "OllamaExtractor")
