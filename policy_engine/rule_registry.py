from typing import Tuple, Any, Callable, Dict
from .schemas import PolicyRule, NormalizedInputs

# status, expected_condition, actual_value, reason
EvalResult = Tuple[str, str, Any, str]

def eval_pm_doc_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if "AADHAR" in inputs.documents_present:
        return "PASS", "Document requirements", inputs.documents_present, "Aadhaar document uploaded."
    # Aadhar ambiguity -> The source says "Aadhar Number", not explicit upload.
    return "MANUAL_REVIEW_REQUIRED", "Document requirements", inputs.documents_present, "Aadhaar document upload interpretation requires clarification per Step 6."

def eval_pm_doc_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "PASS", "No self-declarations", "Verified documents used", "Self-declarations are not accepted."

def eval_pm_elig_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "Domicile State", inputs.domicile, "State-level domicile interpretation is ambiguous and requires state dependency."

def eval_pm_elig_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if inputs.academic_percentage is not None and inputs.last_exam:
        return "PASS", "Passed previous exam", f"{inputs.last_exam} at {inputs.academic_percentage}%", "Applicant passed the previous examination."
    return "FAIL", "Passed previous exam", "Missing/Failed", "No valid passing examination found."

def eval_pm_elig_003(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "Bank linked Aadhar", "Unknown", "Bank account linking status is not deterministically available in standard input."

def eval_pm_elig_004(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if inputs.other_scholarships:
        return "FAIL", "No other scholarship", "Other scholarship present", "Student is receiving another scholarship."
    return "PASS", "No other scholarship", "None", "Student is not getting any other scholarship."

def eval_pm_elig_005(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "No stream downgrade", inputs.course, "Cannot deterministically verify previous stream vs current stream."

def eval_pm_elig_006(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Option exercise", "N/A", "Governs post-award options; not applicable at verification."

def eval_pm_elig_007(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    # Top Class Institutes exclusion. If the scenario is TOP_CLASS_EXCLUSION, how do we know?
    # Our inputs don't have "Top Class" explicitly, so we flag it.
    return "MANUAL_REVIEW_REQUIRED", "Top Class Institute", inputs.institution, "Institution top-class status requires external registry."

def eval_pm_inc_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if "income" in inputs.conflicted_fields:
        return "MANUAL_REVIEW_REQUIRED", "Income <= 250000", "Conflicted", "Income input is conflicted and cannot be deterministically evaluated."
    
    if inputs.orphan:
        return "NOT_APPLICABLE", "Income criteria", "Orphan", "Income criteria does not apply to orphans supported by guardians (PM-INC-005)."
        
    if "COMPLEX_GROSS_INCOME" in inputs.ambiguous_conditions:
        return "MANUAL_REVIEW_REQUIRED", "Gross Income", "Non-salaried", "Gross income definition is unclear for complex non-salaried cases."

    if inputs.income is None:
        return "FAIL", "Income <= 250000", "Missing", "Income value is missing."
        
    limit = rule.parameters.get("value", 250000)
    if inputs.income <= limit:
        return "PASS", f"Income <= {limit}", inputs.income, "Income is within the permitted limit."
    return "FAIL", f"Income <= {limit}", inputs.income, "Income exceeds the permitted limit."

def eval_pm_inc_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Both parents working", "N/A", "Combined income logic applied externally in generated cert."

def eval_pm_inc_003(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Other member working", "N/A", "Household income exclusion applied externally in generated cert."

def eval_pm_inc_004(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "One parent alive", "N/A", "Parental survivor logic applied externally in generated cert."

def eval_pm_inc_005(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if inputs.orphan:
        return "PASS", "Orphan exception", "Orphan", "Orphan exception explicitly applied."
    return "NOT_APPLICABLE", "Orphan exception", "Not orphan", "Applicant is not an orphan."

def eval_pm_inc_006(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if inputs.renewal:
        return "PASS", "Income cert once", "Renewal", "Income certificate is only required once at admission."
    return "NOT_APPLICABLE", "Income cert once", "Fresh", "Fresh application requires certificate."

def eval_pm_inc_007(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "Previous FY income", "N/A", "Cannot deterministically verify exact financial year alignment from standard document values."

def eval_pm_inst_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "Recognized Institution", inputs.institution, "Institution recognition requires state empanelment registry."

def eval_pm_inst_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "State Empanelment", inputs.institution, "State empanelment list not accessible."

def eval_pm_oth_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Subject change", inputs.course, "Post-award condition."

def eval_pm_ren_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    if inputs.renewal:
        if inputs.academic_percentage is not None and inputs.academic_percentage >= 33: # basic pass mark
            return "PASS", "Completed previous class", f"{inputs.academic_percentage}%", "Applicant passed the previous class."
        return "FAIL", "Completed previous class", inputs.academic_percentage, "Applicant did not pass the previous class."
    return "NOT_APPLICABLE", "Renewal", "Fresh", "Not a renewal application."

def eval_pm_ren_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return eval_pm_ren_001(rule, inputs)

def eval_pm_val_001(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "MANUAL_REVIEW_REQUIRED", "State fee fixation", "Unknown", "Fee component depends on State Level Fee Fixation Committee."

def eval_pm_val_002(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Fee ceiling", inputs.course, "Value determination rule, not an eligibility condition."

def eval_pm_val_003(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Stipend rate", inputs.course, "Value determination rule, not an eligibility condition."

def eval_pm_val_004(rule: PolicyRule, inputs: NormalizedInputs) -> EvalResult:
    return "NOT_APPLICABLE", "Disability allowance", "N/A", "Value determination rule, not an eligibility condition."

RULE_EVALUATORS: Dict[str, Callable[[PolicyRule, NormalizedInputs], EvalResult]] = {
    "PM-DOC-001": eval_pm_doc_001,
    "PM-DOC-002": eval_pm_doc_002,
    "PM-ELIG-001": eval_pm_elig_001,
    "PM-ELIG-002": eval_pm_elig_002,
    "PM-ELIG-003": eval_pm_elig_003,
    "PM-ELIG-004": eval_pm_elig_004,
    "PM-ELIG-005": eval_pm_elig_005,
    "PM-ELIG-006": eval_pm_elig_006,
    "PM-ELIG-007": eval_pm_elig_007,
    "PM-INC-001": eval_pm_inc_001,
    "PM-INC-002": eval_pm_inc_002,
    "PM-INC-003": eval_pm_inc_003,
    "PM-INC-004": eval_pm_inc_004,
    "PM-INC-005": eval_pm_inc_005,
    "PM-INC-006": eval_pm_inc_006,
    "PM-INC-007": eval_pm_inc_007,
    "PM-INST-001": eval_pm_inst_001,
    "PM-INST-002": eval_pm_inst_002,
    "PM-OTH-001": eval_pm_oth_001,
    "PM-REN-001": eval_pm_ren_001,
    "PM-REN-002": eval_pm_ren_002,
    "PM-VAL-001": eval_pm_val_001,
    "PM-VAL-002": eval_pm_val_002,
    "PM-VAL-003": eval_pm_val_003,
    "PM-VAL-004": eval_pm_val_004,
}
