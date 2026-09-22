from .schemas import ValidationFinding, ValidationValue, ValidationEvidence
from .normalizers import Normalizer
from .comparators import Comparator
from typing import List, Dict, Any

class Validator:
    def __init__(self, validation_type: str, semantic_fields: List[str], normalizer_func):
        self.validation_type = validation_type
        self.semantic_fields = semantic_fields
        self.normalizer_func = normalizer_func

    def validate(self, app_id: str, extracted_docs: List[Dict[str, Any]]) -> ValidationFinding:
        vals = []
        evidences = []
        for doc in extracted_docs:
            for sf in self.semantic_fields:
                if sf in doc['fields']:
                    f = doc['fields'][sf]
                    if f.raw_value:
                        norm = self.normalizer_func(f.raw_value)
                        vals.append(ValidationValue(
                            document_id=doc['document_id'],
                            document_type=doc['document_type'],
                            field=sf,
                            raw_value=f.raw_value,
                            normalized_value=norm
                        ))
                        evidences.append(ValidationEvidence(
                            document_id=doc['document_id'],
                            field=sf
                        ))
                    break # found the field for this doc
        
        if not vals:
            return ValidationFinding(
                application_id=app_id,
                validation_type=self.validation_type,
                status="NOT_APPLICABLE",
                field=self.semantic_fields[0],
                values=[],
                reason="Field not present in any processed documents.",
                evidence=[]
            )
        
        if len(vals) == 1:
            return ValidationFinding(
                application_id=app_id,
                validation_type=self.validation_type,
                status="PASS",
                field=self.semantic_fields[0],
                values=vals,
                reason="Field present in only one document. No contradictions.",
                evidence=evidences
            )

        # Compare multiple values
        norm_values = [v.normalized_value for v in vals]
        if Comparator.compare_exact(norm_values):
            return ValidationFinding(
                application_id=app_id,
                validation_type=self.validation_type,
                status="PASS",
                field=self.semantic_fields[0],
                values=vals,
                reason="Normalized values are consistent.",
                evidence=evidences
            )
        else:
            return ValidationFinding(
                application_id=app_id,
                validation_type=self.validation_type,
                status="FAIL",
                field=self.semantic_fields[0],
                values=vals,
                reason="Normalized values do not match.",
                evidence=evidences
            )

class NameValidator(Validator):
    def __init__(self):
        super().__init__("NAME_CONSISTENCY", ["Applicant Name", "Name", "Student Name", "Applicant"], Normalizer.normalize_name)

class DobValidator(Validator):
    def __init__(self):
        super().__init__("DOB_CONSISTENCY", ["Date of Birth", "DOB"], Normalizer.normalize_dob)

class CategoryValidator(Validator):
    def __init__(self):
        super().__init__("CATEGORY_CONSISTENCY", ["Category"], Normalizer.normalize_category)

class IncomeValidator(Validator):
    def __init__(self):
        super().__init__("INCOME_CONSISTENCY", ["Annual Family Income"], Normalizer.normalize_income)

class InstitutionValidator(Validator):
    def __init__(self):
        super().__init__("INSTITUTION_CONSISTENCY", ["Institution", "University"], Normalizer.normalize_institution)

class CourseValidator(Validator):
    def __init__(self):
        super().__init__("COURSE_CONSISTENCY", ["Course / Programme", "Course"], Normalizer.normalize_course)

