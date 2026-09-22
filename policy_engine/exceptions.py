class PolicyEngineException(Exception):
    pass

class PolicyResolutionError(PolicyEngineException):
    """Raised when an input cannot be resolved deterministically due to ambiguity or conflict."""
    pass

class PolicyDataMissingError(PolicyEngineException):
    """Raised when required parameters are missing from a policy rule."""
    pass
