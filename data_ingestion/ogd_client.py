import time
import requests
from typing import Dict, Any

from .config import Config
from .cache import get_cached, set_cache

class OGDClientError(Exception):
    pass

class OGDClient:
    def __init__(self):
        self.api_key = Config.DATA_GOV_API_KEY
        self.base_url = Config.DATA_GOV_BASE_URL

    def fetch_resource(self, resource_uuid: str, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        if not self.api_key:
            raise OGDClientError("DATA_GOV_API_KEY not configured. Official ingestion requires a valid API key.")
        
        cache_key = f"{resource_uuid}_{limit}_{offset}"
        cached = get_cached(cache_key)
        if cached:
            return cached

        url = f"{self.base_url}/{resource_uuid}"
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit,
            "offset": offset
        }

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code == 429:
                # Basic backoff
                time.sleep(2)
                response = requests.get(url, params=params, headers=headers, timeout=10)
                
            response.raise_for_status()
            data = response.json()
            
            # Simple validation to ensure it's not a successful response with an error payload
            if data.get("status") == "error":
                raise OGDClientError(f"API Error: {data.get('message')}")
                
            if not data.get("records"):
                if data.get("count", -1) == 0:
                    pass # Empty is fine, just means 0 records
                elif "records" not in data:
                    raise OGDClientError("Malformed JSON response: missing 'records' field.")
            
            set_cache(cache_key, data)
            return data
            
        except requests.exceptions.RequestException as e:
            raise OGDClientError(f"HTTP request failed: {str(e)}")
