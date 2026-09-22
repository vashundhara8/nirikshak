class DocumentClassifier:
    def classify(self, text: str) -> str:
        text = text.upper()
        
        # Explicit watermarks created by the generator:
        if "SYNTHETIC DOCUMENT: ST_CERTIFICATE" in text: return "ST_CERTIFICATE"
        if "SYNTHETIC DOCUMENT: INCOME_CERTIFICATE" in text: return "INCOME_CERTIFICATE"
        if "SYNTHETIC DOCUMENT: DOMICILE_CERTIFICATE" in text: return "DOMICILE_CERTIFICATE"
        if "SYNTHETIC DOCUMENT: AADHAR" in text: return "AADHAR"
        if "SYNTHETIC DOCUMENT: MARKSHEET" in text: return "MARKSHEET"
        if "SYNTHETIC DOCUMENT: PASSPORT_PHOTO" in text: return "PASSPORT_PHOTO"
        
        # Fallback keywords
        if "CATEGORY:" in text: return "ST_CERTIFICATE"
        if "INCOME" in text: return "INCOME_CERTIFICATE"
        if "RESIDENT" in text: return "DOMICILE_CERTIFICATE"
        if "PERCENT" in text: return "MARKSHEET"
        if "FACE" in text: return "PASSPORT_PHOTO"
        if "AADHAR" in text: return "AADHAR"
        
        return "UNKNOWN"
