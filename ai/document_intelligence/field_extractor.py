import re
from typing import Dict, Any

class FieldExtractor:
    def extract(self, document_type: str, text: str) -> Dict[str, str]:
        fields = {}
        # Helper to extract using regex
        def get_match(pattern):
            match = re.search(pattern, text, re.IGNORECASE)
            return match.group(1).strip() if match else None

        if document_type == "ST_CERTIFICATE":
            fields["Applicant Name"] = get_match(r"Applicant Name:\s*(.+)")
            fields["Date of Birth"] = get_match(r"Date of Birth:\s*(.+)")
            fields["Category"] = get_match(r"Category:\s*(.+)")
            fields["Domicile State"] = get_match(r"Domicile State:\s*(.+)")
            fields["Issuing Authority"] = get_match(r"Issuing Authority:\s*(.+)")

        elif document_type == "INCOME_CERTIFICATE":
            fields["Applicant Name"] = get_match(r"Applicant Name:\s*(.+)")
            fields["Annual Family Income"] = get_match(r"Annual Family Income:\s*(.+)")
            fields["Income Source"] = get_match(r"Income Source:\s*(.+)")
            fields["Financial Year"] = get_match(r"Financial Year:\s*(.+)")

        elif document_type == "DOMICILE_CERTIFICATE":
            fields["Applicant Name"] = get_match(r"Applicant Name:\s*(.+)")
            fields["Resident State"] = get_match(r"Resident State:\s*(.+)")
            fields["Status"] = get_match(r"Status:\s*(.+)")

        elif document_type == "AADHAR":
            fields["Name"] = get_match(r"Name:\s*(.+)")
            fields["DOB"] = get_match(r"DOB:\s*(.+)")
            fields["Gender"] = get_match(r"Gender:\s*(.+)")
            fields["Aadhar Number"] = get_match(r"Aadhar Number:\s*(.+)")

        elif document_type == "MARKSHEET":
            fields["Student Name"] = get_match(r"Student Name:\s*(.+)")
            fields["Date of Birth"] = get_match(r"Date of Birth:\s*(.+)")
            fields["Institution"] = get_match(r"Institution:\s*(.+)")
            fields["Course / Programme"] = get_match(r"Course / Programme:\s*(.+)")
            fields["Academic Year"] = get_match(r"Academic Year:\s*(.+)")
            fields["Examination"] = get_match(r"Examination:\s*(.+)")
            fields["Percentage"] = get_match(r"Percentage:\s*(.+)")
            fields["Result"] = get_match(r"Result:\s*(.+)")

        elif document_type == "PASSPORT_PHOTO":
            fields["Applicant"] = get_match(r"Applicant:\s*(.+)")
            fields["Image"] = get_match(r"Image:\s*(.+)")

        return {k: v for k, v in fields.items() if v is not None}
