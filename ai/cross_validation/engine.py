from typing import List, Dict, Any
from .schemas import ValidationFinding
from .validators import NameValidator, DobValidator, CategoryValidator, IncomeValidator, InstitutionValidator, CourseValidator

class CrossValidationEngine:
    def __init__(self):
        self.validators = [
            NameValidator(),
            DobValidator(),
            CategoryValidator(),
            IncomeValidator(),
            InstitutionValidator(),
            CourseValidator()
        ]

    def validate_application(self, app_id: str, extracted_docs: List[Dict[str, Any]]) -> List[ValidationFinding]:
        findings = []
        for validator in self.validators:
            finding = validator.validate(app_id, extracted_docs)
            findings.append(finding)
        return findings
