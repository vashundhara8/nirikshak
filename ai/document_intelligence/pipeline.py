import os
from .schemas import DocumentExtractionResult, ExtractionField
from .pdf_inspector import PDFInspector
from .text_extractor import TextExtractor
from .ocr_engine import OCREngine
from .preprocessing import Preprocessor
from .classifier import DocumentClassifier
from .field_extractor import FieldExtractor
from .normalizer import Normalizer

class DocumentPipeline:
    def __init__(self):
        self.inspector = PDFInspector()
        self.text_extractor = TextExtractor()
        self.ocr_engine = OCREngine()
        self.preprocessor = Preprocessor()
        self.classifier = DocumentClassifier()
        self.field_extractor = FieldExtractor()
        self.normalizer = Normalizer()

    def process_document(self, filepath: str, doc_id: str, app_id: str = None) -> DocumentExtractionResult:
        inspection = self.inspector.inspect(filepath)
        raw_text = ""
        extraction_method = ""
        notes = []

        if inspection.get("usable_text"):
            raw_text = self.text_extractor.extract(filepath)
            extraction_method = "DIRECT_TEXT_RULE_BASELINE"
            notes.append("Extracted using PyMuPDF direct text extraction.")
        else:
            if not self.ocr_engine.available:
                extraction_method = "OCR_UNAVAILABLE"
                notes.append("OCR engine not available. Unable to process rasterized/unusable text document.")
            else:
                processed_path = self.preprocessor.process(filepath)
                raw_text = self.ocr_engine.extract(processed_path)
                extraction_method = "PRETRAINED_MODEL" if raw_text else "OCR_FAILED"
                notes.append("Extracted using PaddleOCR fallback.")

        # If OCR_UNAVAILABLE or OCR_FAILED, we may have no text.
        doc_type = "UNKNOWN"
        if raw_text.strip():
            doc_type = self.classifier.classify(raw_text)

        fields_dict = {}
        if doc_type != "UNKNOWN" and raw_text.strip():
            raw_fields = self.field_extractor.extract(doc_type, raw_text)
            for k, v in raw_fields.items():
                norm = self.normalizer.normalize(v)
                fields_dict[k] = ExtractionField(
                    field_name=k,
                    raw_value=v,
                    normalized_value=norm,
                    extraction_method="RULE_BASELINE"
                )

        return DocumentExtractionResult(
            document_id=doc_id,
            application_id=app_id,
            document_type=doc_type,
            classification_method="RULE_BASELINE",
            extraction_method=extraction_method,
            fields=fields_dict,
            status="SUCCESS" if doc_type != "UNKNOWN" else "FAILED",
            notes=" ".join(notes)
        )
