import fitz

class PDFInspector:
    def inspect(self, filepath: str) -> dict:
        try:
            doc = fitz.open(filepath)
            page_count = len(doc)
            text_density = 0
            raw_text = ""
            for page in doc:
                text = page.get_text()
                raw_text += text
            
            # Simple heuristic for usable text
            usable_text = len(raw_text.strip()) > 50
            
            return {
                "page_count": page_count,
                "usable_text": usable_text,
                "raw_text": raw_text
            }
        except Exception as e:
            return {
                "page_count": 0,
                "usable_text": False,
                "raw_text": "",
                "error": str(e)
            }
