class Normalizer:
    def normalize(self, raw_value: str) -> str:
        if not raw_value:
            return ""
        # The synthetic data is already mostly clean, 
        # but to prove normalization we will convert everything to UPPERCASE.
        # If it were dates, we would parse and reformat.
        return str(raw_value).upper().strip()
