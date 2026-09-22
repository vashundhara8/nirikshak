import fitz

class TextExtractor:
    def extract(self, filepath: str) -> str:
        try:
            doc = fitz.open(filepath)
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            return ""
