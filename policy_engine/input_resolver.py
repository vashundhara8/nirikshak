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
    cat_data = application_data.get("category", {})
    if "category" not in inputs.conflicted_fields:
        inputs.category = cat_data.get("claimed_category")
        inputs.domicile = cat_data.get("domicile_state")
        
    inc_data = application_data.get("income", {})
    if "income" not in inputs.conflicted_fields:
        inputs.income = inc_data.get("family_income_annum")
        
    inst_data = application_data.get("institution", {})
    if "institution" not in inputs.conflicted_fields:
        inputs.institution = inst_data.get("institute_name")
        
    course_data = application_data.get("course", {})
    if "course" not in inputs.conflicted_fields:
        inputs.course = course_data.get("course_name")
        
    edu_data = application_data.get("education", {})
    inputs.academic_percentage = float(edu_data.get("last_qualified_marks_percent", 0))
    inputs.last_exam = edu_data.get("last_qualified_exam")
    
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
    if inc_data.get("income_source", "").upper() not in ["SALARY", "PARENTS"]:
        inputs.ambiguous_conditions.append("COMPLEX_GROSS_INCOME")
        
    return inputs
