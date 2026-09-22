class Preprocessor:
    def process(self, filepath: str) -> str:
        # In a real environment, this might perform deskewing, binarization, or contrast enhancement.
        # For this synthetic benchmark, we rely on PyMuPDF and PaddleOCR's internal preprocessing.
        # We return the original filepath.
        return filepath
