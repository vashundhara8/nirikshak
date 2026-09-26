"""
tests/unit/test_ocr_temp_file_cleanup.py

Unit tests for the OCR engine temp file cleanup fix (P2-15).
Verifies that the temp PNG file is deleted even when OCR raises an exception.
PaddleOCR is not required to be installed — the test patches at the right boundary.
"""
import os
import tempfile
import unittest.mock as mock

import pytest


def test_temp_file_cleaned_up_on_ocr_exception(tmp_path):
    """Temp PNG must be deleted even when ocr() raises."""
    # Patch PaddleOCR at the import level inside OCREngine.__init__
    fake_png = tmp_path / "test_doc.pdf_temp.png"

    class FakePaddleOCR:
        def __init__(self, **kwargs):
            pass

        def ocr(self, img_path):
            # Create the temp file to simulate pix.save()
            with open(img_path, "wb") as f:
                f.write(b"fake png data")
            raise RuntimeError("Simulated OCR failure")

    with mock.patch.dict("sys.modules", {"paddleocr": mock.MagicMock(PaddleOCR=FakePaddleOCR)}):
        # Force re-import with the mock in place
        import importlib
        import ai.document_intelligence.ocr_engine as ocr_mod
        importlib.reload(ocr_mod)

        engine = ocr_mod.OCREngine()
        engine.available = True
        engine.engine = FakePaddleOCR()

        # Create a minimal fake PDF that fitz can open
        import fitz  # PyMuPDF
        doc = fitz.Document()
        doc.new_page()
        pdf_path = str(tmp_path / "test_doc.pdf")
        doc.save(pdf_path)
        doc.close()

        # Run extraction — should not raise even though OCR fails inside
        result = engine.extract(pdf_path)
        assert result == ""

        # The temp PNG for this page should have been created then deleted
        expected_temp = pdf_path + "_temp.png"
        assert not os.path.exists(expected_temp), (
            f"Temp file {expected_temp} was NOT cleaned up after OCR exception"
        )


def test_temp_file_cleaned_up_on_success(tmp_path):
    """Temp PNG must also be deleted on the success path."""
    class FakePaddleOCRSuccess:
        def __init__(self, **kwargs):
            pass

        def ocr(self, img_path):
            with open(img_path, "wb") as f:
                f.write(b"fake png data")
            return [[("bbox", ("extracted text", 0.99))]]

    with mock.patch.dict("sys.modules", {"paddleocr": mock.MagicMock(PaddleOCR=FakePaddleOCRSuccess)}):
        import importlib
        import ai.document_intelligence.ocr_engine as ocr_mod
        importlib.reload(ocr_mod)

        engine = ocr_mod.OCREngine()
        engine.available = True
        engine.engine = FakePaddleOCRSuccess()

        import fitz
        doc = fitz.Document()
        doc.new_page()
        pdf_path = str(tmp_path / "test_success.pdf")
        doc.save(pdf_path)
        doc.close()

        result = engine.extract(pdf_path)
        assert result == "extracted text"

        expected_temp = pdf_path + "_temp.png"
        assert not os.path.exists(expected_temp), (
            f"Temp file {expected_temp} was NOT cleaned up after successful OCR"
        )
