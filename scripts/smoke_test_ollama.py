import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ai.providers.ollama_provider import OllamaProvider
from ai.document_intelligence.ollama_extractor import OllamaExtractor

def run_smoke_test():
    print("Initializing Ollama provider...")
    provider = OllamaProvider()
    
    if not provider.is_available():
        print(f"FAILED: Ollama provider is not available. Check if {provider.base_url} is running and {provider.model} is installed.")
        return
        
    print(f"Ollama is available. Model: {provider.model}")
    
    extractor = OllamaExtractor(provider)
    
    synthetic_text = """
    Name: Ananya Rao
    Date of Birth: 14/08/2004
    Category: Scheduled Tribe
    Institution: Example University
    Course: Bachelor of Commerce
    Academic Year: 2026-27
    """
    
    doc_type = "ST_CERTIFICATE"
    
    print("\nRunning extraction...")
    result = extractor.extract(doc_type, synthetic_text)
    
    if result["status"] == "SUCCESS":
        print("SUCCESS! Extracted fields:")
        for k, v in result["fields"].items():
            print(f"  {k}: {v}")
        print("\nMetadata:")
        for k, v in result["metadata"].items():
            print(f"  {k}: {v}")
    else:
        print(f"FAILED: Extraction failed. Error: {result.get('error')}")

if __name__ == "__main__":
    run_smoke_test()
