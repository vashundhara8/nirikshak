import re
import json

file_path = "frontend/src/lib/i18n.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

en_additions = {
  "how.service_clarity": "Service Clarity",
  "how.title": "How to Apply",
  "how.step1.title": "Register & Profile Setup",
  "how.step1.desc": "Create your account using your Mobile Number or Aadhaar. Fill in your basic demographic details.",
  "how.step2.title": "Choose Scheme & Upload",
  "how.step2.desc": "Select the appropriate scholarship scheme and upload digitally verifiable documents (PDFs).",
  "how.step3.title": "Automated Verification",
  "how.step3.desc": "The NIRIKSHAK engine automatically verifies your document integrity and extracts data instantly.",
  "how.step4.title": "Officer Review & DBT",
  "how.step4.desc": "A Nodal Officer performs final scrutiny. Once approved, funds are transferred via Direct Benefit Transfer.",
  "docs.title": "Required Documents",
  "docs.desc": "Please keep clear, legible PDF copies of the following documents ready before starting your application.",
  "docs.doc1": "Caste / Tribe Certificate (Issued by competent authority)",
  "docs.doc2": "Valid Income Certificate (Current financial year)",
  "docs.doc3": "Domicile / Resident Certificate",
  "docs.doc4": "Aadhaar Card (For identity & DBT linkage)",
  "docs.doc5": "Previous Year Academic Marksheet",
  "docs.doc6": "Institution Admission Proof / Fee Receipt",
  "docs.note_label": "Note:",
  "docs.note_text": "Uploaded documents must be authentic. Forgery will lead to immediate rejection and legal action under Government of India guidelines."
}

hi_additions = {
  "how.service_clarity": "सेवा स्पष्टता",
  "how.title": "आवेदन कैसे करें",
  "how.step1.title": "पंजीकरण और प्रोफ़ाइल सेटअप",
  "how.step1.desc": "अपने मोबाइल नंबर या आधार का उपयोग करके अपना खाता बनाएं। अपना मूल जनसांख्यिकीय विवरण भरें।",
  "how.step2.title": "योजना चुनें और अपलोड करें",
  "how.step2.desc": "उपयुक्त छात्रवृत्ति योजना का चयन करें और डिजिटल रूप से सत्यापन योग्य दस्तावेज़ (पीडीएफ) अपलोड करें।",
  "how.step3.title": "स्वचालित सत्यापन",
  "how.step3.desc": "निरीक्षक इंजन स्वचालित रूप से आपके दस्तावेज़ की अखंडता की पुष्टि करता है और तुरंत डेटा निकालता है।",
  "how.step4.title": "अधिकारी समीक्षा और डीबीटी",
  "how.step4.desc": "एक नोडल अधिकारी अंतिम जांच करता है। एक बार स्वीकृत होने के बाद, प्रत्यक्ष लाभ अंतरण के माध्यम से धनराशि स्थानांतरित की जाती है।",
  "docs.title": "आवश्यक दस्तावेज़",
  "docs.desc": "कृपया अपना आवेदन शुरू करने से पहले निम्नलिखित दस्तावेजों की स्पष्ट, सुपाठ्य पीडीएफ प्रतियां तैयार रखें।",
  "docs.doc1": "जाति / जनजाति प्रमाण पत्र (सक्षम प्राधिकारी द्वारा जारी)",
  "docs.doc2": "वैध आय प्रमाण पत्र (वर्तमान वित्तीय वर्ष)",
  "docs.doc3": "अधिवास / निवास प्रमाण पत्र",
  "docs.doc4": "आधार कार्ड (पहचान और डीबीटी लिंकेज के लिए)",
  "docs.doc5": "पिछले वर्ष की शैक्षणिक मार्कशीट",
  "docs.doc6": "संस्थान प्रवेश प्रमाण / शुल्क रसीद",
  "docs.note_label": "नोट:",
  "docs.note_text": "अपलोड किए गए दस्तावेज़ प्रामाणिक होने चाहिए। जालसाजी के कारण भारत सरकार के दिशानिर्देशों के तहत तत्काल अस्वीकृति और कानूनी कार्रवाई की जाएगी।"
}

def inject_dict(content, dict_name, additions):
    # Find the end of the dictionary
    pattern = rf"(const {dict_name} = {{.*?)(\n}});"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return content
    
    dict_content = match.group(1)
    # add a comma to the last item if not there
    if not dict_content.strip().endswith(","):
        dict_content += ","
        
    for k, v in additions.items():
        dict_content += f'\n  "{k}": "{v}",'
        
    return content[:match.start()] + dict_content + match.group(2) + content[match.end():]

content = inject_dict(content, "en", en_additions)
content = inject_dict(content, "hi", hi_additions)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated i18n.tsx successfully.")
