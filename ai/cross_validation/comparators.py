class Comparator:
    @staticmethod
    def compare_exact(values: list) -> bool:
        if not values:
            return False
        first_val = values[0]
        for v in values[1:]:
            if v != first_val:
                return False
        return True
