import asyncio
from ai.providers.ollama_provider import OllamaProvider
from ai.document_intelligence.ollama_extractor import OllamaExtractor

def run_smoke_test():
    provider = OllamaProvider()
    print("Ollama enabled:", provider.enabled)
    print("Ollama available:", provider.is_available())
    
    if not provider.is_available():
        print("Skipping extraction test as provider is not available.")
        return
        
    extractor = OllamaExtractor(provider)
    
    synthetic_text = """
    Name: Ananya Rao
    Date of Birth: 14/08/2004
    Category: Scheduled Tribe
    Institution: Example University
    Course: Bachelor of Commerce
    Academic Year: 2026-27
    """
    
    print("Running extraction...")
    result = extractor.extract("INCOME_CERTIFICATE", synthetic_text)
    
    print("Result:")
    import pprint
    pprint.pprint(result)

if __name__ == "__main__":
    run_smoke_test()
