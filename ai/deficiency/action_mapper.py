from .schemas import DeficiencyCategory, DeficiencyType, ActionGuidance, RerunScope, ResponsibleParty

def get_action_guidance(category: DeficiencyCategory, def_type: DeficiencyType) -> ActionGuidance:
    if def_type == DeficiencyType.MISSING_DOCUMENT:
        return ActionGuidance(
            message=f"Required document is missing for {category.value}.",
            action_required="Upload the required document.",
            correction_guidance="Provide the missing document and resubmit the application."
        )
    elif def_type == DeficiencyType.FIELD_MISMATCH:
        return ActionGuidance(
            message=f"Discrepancy found in {category.value} between submitted documents.",
            action_required="Verify the discrepancy.",
            correction_guidance="Submit a corrected document or supporting clarification according to the applicable process."
        )
    elif def_type == DeficiencyType.VALUE_CONFLICT:
        return ActionGuidance(
            message=f"Multiple conflicting values found for {category.value}.",
            action_required="Resolve the conflict.",
            correction_guidance="Ensure all submitted documents reflect consistent information."
        )
    elif def_type == DeficiencyType.THRESHOLD_FAILURE:
        if category == DeficiencyCategory.INCOME:
            return ActionGuidance(
                message="Reported income exceeds the configured policy threshold.",
                action_required="Review income eligibility.",
                correction_guidance="Provide a valid income certificate or correction if the submitted value is incorrect."
            )
        else:
            return ActionGuidance(
                message=f"Threshold condition not met for {category.value}.",
                action_required="Review eligibility criteria.",
                correction_guidance="Provide corrected evidence if applicable."
            )
    elif def_type == DeficiencyType.UNVERIFIED_REFERENCE:
        return ActionGuidance(
            message=f"System could not verify the provided {category.value}.",
            action_required="Perform reference check.",
            correction_guidance="Ensure the details match official registries."
        )
    elif def_type == DeficiencyType.DUPLICATE_LIKE:
        return ActionGuidance(
            message="Application appears similar to another existing record.",
            action_required="Perform deduplication review.",
            correction_guidance="Confirm applicant uniqueness."
        )
    elif def_type == DeficiencyType.RENEWAL_CHECK:
        return ActionGuidance(
            message="Renewal conditions not fully met or missing prior history.",
            action_required="Verify previous scholarship details.",
            correction_guidance="Provide evidence of previous award or academic progression."
        )
    
    # Generic fallback
    return ActionGuidance(
        message=f"Issue detected with {category.value}.",
        action_required="Review the finding.",
        correction_guidance="Correct the underlying data or provide clarification."
    )
