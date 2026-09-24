import requests
import json
import logging
from backend.app.core.config import settings
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class OllamaProvider:
    def __init__(self):
        self.enabled = settings.OLLAMA_ENABLED
        self.base_url = settings.OLLAMA_BASE_URL.rstrip('/')
        self.model = settings.OLLAMA_TEXT_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
        
    def is_available(self) -> bool:
        """Check if Ollama is running and the model is available."""
        if not self.enabled:
            return False
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                return self.model in models
        except Exception:
            return False
        return False

    def generate(self, prompt: str, require_json: bool = False) -> Dict[str, Any]:
        """
        Run inference using the local Ollama API.
        Returns a dictionary with status and output.
        """
        if not self.enabled:
            return {"status": "DISABLED", "error": "Ollama provider is disabled via configuration."}
        
        if not self.is_available():
            return {"status": "UNAVAILABLE", "error": f"Ollama or model {self.model} is not available."}
            
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.0,
                "top_k": 10,
                "top_p": 0.1,
                "seed": 42
            }
        }
        
        if require_json:
            payload["format"] = "json"
        
        try:
            resp = requests.post(url, json=payload, timeout=self.timeout)
            resp.raise_for_status()
            data = resp.json()
            return {
                "status": "SUCCESS",
                "response": data.get("response", ""),
                "provider": "ollama",
                "model": self.model
            }
        except requests.exceptions.Timeout:
            logger.error("Ollama API timed out")
            return {"status": "TIMEOUT", "error": "Request timed out"}
        except requests.exceptions.ConnectionError:
            logger.error("Ollama API connection error")
            return {"status": "CONNECTION_ERROR", "error": "Failed to connect to Ollama API"}
        except Exception as e:
            logger.error(f"Ollama inference error: {e}")
            return {"status": "ERROR", "error": str(e)}
