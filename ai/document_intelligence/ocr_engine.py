import os
import fitz

class OCREngine:
    def __init__(self):
        self.available = False
        self.engine = None
        try:
            from paddleocr import PaddleOCR
            # use_angle_cls=True to handle rotations properly, lang='en'
            self.engine = PaddleOCR(use_angle_cls=True, lang='en', enable_mkldnn=False)
            self.available = True
        except ImportError:
            self.available = False
        except Exception as e:
            print(f"PaddleOCR init failed: {e}")
            self.available = False

    def extract(self, filepath: str) -> str:
        if not self.available:
            return ""
        
        try:
            doc = fitz.open(filepath)
            full_text = []
            for page in doc:
                pix = page.get_pixmap()
                img_path = filepath + "_temp.png"
                pix.save(img_path)
                
                result = self.engine.ocr(img_path)
                if result and result[0]:
                    for line in result[0]:
                        text = line[1][0]
                        full_text.append(text)
                
                if os.path.exists(img_path):
                    os.remove(img_path)
            return "\n".join(full_text)
        except Exception as e:
            print(f"OCR Exception: {e}")
            return ""
