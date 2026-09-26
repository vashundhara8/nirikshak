import os
import fitz

class OCREngine:
    def __init__(self):
        # PaddleOCR initialization is deferred to first use.
        # Constructing OCREngine does NOT perform any network or disk I/O.
        self._initialized = False
        self._available = False
        self.engine = None

    @property
    def available(self) -> bool:
        """Returns True only after a successful lazy initialization."""
        return self._available

    def _ensure_initialized(self) -> None:
        """Lazily initialize PaddleOCR on first call. No-op if already done."""
        if self._initialized:
            return
        self._initialized = True
        try:
            from paddleocr import PaddleOCR
            # use_angle_cls=True to handle rotations properly, lang='en'
            self.engine = PaddleOCR(use_angle_cls=True, lang='en', enable_mkldnn=False)
            self._available = True
        except ImportError:
            self._available = False
        except Exception as e:
            print(f"PaddleOCR init failed: {e}")
            self._available = False

    def extract(self, filepath: str) -> str:
        self._ensure_initialized()
        if not self._available:
            return ""

        try:
            doc = fitz.open(filepath)
            full_text = []
            for page in doc:
                pix = page.get_pixmap()
                img_path = filepath + "_temp.png"
                pix.save(img_path)
                try:
                    result = self.engine.ocr(img_path)
                    if result and result[0]:
                        for line in result[0]:
                            text = line[1][0]
                            full_text.append(text)
                finally:
                    if os.path.exists(img_path):
                        os.remove(img_path)
            return "\n".join(full_text)
        except Exception as e:
            print(f"OCR Exception: {e}")
            return ""
