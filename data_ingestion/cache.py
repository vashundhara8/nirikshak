import os
import json
import hashlib
from typing import Optional, Dict, Any

from .config import Config

os.makedirs(Config.CACHE_DIR, exist_ok=True)

def _get_cache_path(key: str) -> str:
    hashed_key = hashlib.sha256(key.encode('utf-8')).hexdigest()
    return os.path.join(Config.CACHE_DIR, f"{hashed_key}.json")

def get_cached(key: str) -> Optional[Dict[str, Any]]:
    path = _get_cache_path(key)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def set_cache(key: str, data: Dict[str, Any]):
    path = _get_cache_path(key)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
