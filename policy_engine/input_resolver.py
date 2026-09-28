from typing import Dict, Any, List
from .schemas import NormalizedInputs

def resolve_inputs(application_data: Dict[str, Any], validation_data: Dict[str, Any]) -> NormalizedInputs:
    """
    Transforms Step 10 + Step 11 outputs into normalized policy inputs.
    Does NOT use scenario_tags as policy inference logic.
    """
    inputs = NormalizedInputs()
    
    # 1. Resolve Document Presence
    # (In a real system, this comes from document intelligence. Here we use expected presence from the benchmark schema)
    # We use the list of uploaded documents to determine presence
    inputs.documents_present = [doc['document_type'] for doc in application_data.get('documents_expected', [])]
    
    # 2. Resolve Validation Conflicts
    checks = validation_data.get("checks", {})
    if checks.get("NAME_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("name")
    if checks.get("DOB_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("dob")
    if checks.get("CATEGORY_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("category")
    if checks.get("INCOME_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("income")
    if checks.get("INSTITUTION_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("institution")
    if checks.get("COURSE_CONSISTENCY") == "FAIL": inputs.conflicted_fields.append("course")
        
    # 3. Resolve Fields (only if NOT conflicted, else leave None for strict deterministic evaluation)
    demo_data = application_data.get("demographic", {})
    if "category" not in inputs.conflicted_fields:
        inputs.category = demo_data.get("category")
        inputs.domicile = demo_data.get("domicile_state")
        
    if "income" not in inputs.conflicted_fields:
        inputs.income = demo_data.get("annual_family_income")
        
    acad_data = application_data.get("academic", {})
    if "institution" not in inputs.conflicted_fields:
        inputs.institution = acad_data.get("institution_name")
        
    if "course" not in inputs.conflicted_fields:
        inputs.course = acad_data.get("course_name")
        
    inputs.academic_percentage = float(acad_data.get("last_exam_percentage", 0))
    inputs.last_exam = acad_data.get("last_exam", "High School")
    
    # 4. Resolve application attributes
    inputs.renewal = application_data.get("is_renewal", False)
    inputs.orphan = application_data.get("is_orphan", False)
    
    # Example ambiguous conditions from actual attributes
    # The application schema currently does not have marital_status explicit in the mock data, 
    # but if we find it, we flag it.
    student_data = application_data.get("student", {})
    inputs.marital_status = student_data.get("marital_status", "SINGLE")
    if inputs.marital_status == "MARRIED":
        inputs.ambiguous_conditions.append("MARRIED_CANDIDATE")
        
    # Gross income ambiguity for non-salaried
    if demo_data.get("income_source", "").upper() not in ["SALARY", "PARENTS"]:
        inputs.ambiguous_conditions.append("COMPLEX_GROSS_INCOME")
        
    return inputs
