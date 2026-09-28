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

    def validate_application(self, app_id: str, extracted_docs: List[Dict[str, Any]], submitted_data: Dict[str, Any] | None = None) -> List[ValidationFinding]:
        if submitted_data is None:
            submitted_data = {}

        # Create a pseudo-document for application data
        pseudo_doc = {
            'document_id': 'APPLICATION_FORM',
            'document_type': 'APPLICATION',
            'fields': {
                'Applicant Name': {'raw_value': submitted_data.get('applicant', {}).get('name')},
                'DOB': {'raw_value': submitted_data.get('applicant', {}).get('dob')},
                'Category': {'raw_value': submitted_data.get('demographic', {}).get('category')},
                'Annual Family Income': {'raw_value': str(submitted_data.get('demographic', {}).get('annual_family_income', ''))},
                'Institution': {'raw_value': submitted_data.get('academic', {}).get('institution_name')},
                'Course': {'raw_value': submitted_data.get('academic', {}).get('course_name')},
                'Academic Percentage': {'raw_value': str(submitted_data.get('academic', {}).get('last_exam_percentage', ''))}
            }
        }
        
        # Filter out empty fields
        pseudo_doc['fields'] = {k: v for k, v in pseudo_doc['fields'].items() if v['raw_value'] and v['raw_value'] != 'None'}

        all_docs = extracted_docs + [pseudo_doc]
        
        findings = []
        for validator in self.validators:
            finding = validator.validate(app_id, all_docs)
            findings.append(finding)
        return findings
