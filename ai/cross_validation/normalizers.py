import re

class Normalizer:
    @staticmethod
    def normalize_name(name: str) -> str:
        if not name:
            return ""
        # Remove punctuation, extra whitespace, lowercase
        name = re.sub(r'[^\w\s]', '', name)
        name = re.sub(r'\s+', ' ', name)
        return name.strip().lower()

    @staticmethod
    def normalize_dob(dob: str) -> str:
        if not dob:
            return ""
        # Assumes DD-MM-YYYY or DD/MM/YYYY and returns YYYY-MM-DD
        # synthetic data uses DD-MM-YYYY
        dob = dob.replace('/', '-')
        parts = dob.split('-')
        if len(parts) == 3:
            if len(parts[2]) == 4: # DD-MM-YYYY
                return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
            elif len(parts[0]) == 4: # YYYY-MM-DD
                return f"{parts[0]}-{parts[1].zfill(2)}-{parts[2].zfill(2)}"
        return dob.strip()

    @staticmethod
    def normalize_category(category: str) -> str:
        if not category:
            return ""
        return category.strip().upper()

    @staticmethod
    def normalize_income(income: str) -> str:
        if not income:
            return ""
        # Remove anything that isn't a digit
        digits = re.sub(r'\D', '', income)
        return digits

    @staticmethod
    def normalize_institution(inst: str) -> str:
        if not inst:
            return ""
        inst = re.sub(r'[^\w\s]', '', inst)
        inst = re.sub(r'\s+', ' ', inst)
        return inst.strip().lower()

    @staticmethod
    def normalize_course(course: str) -> str:
        if not course:
            return ""
        course = re.sub(r'[^\w\s]', '', course)
        course = re.sub(r'\s+', ' ', course)
        return course.strip().lower()
