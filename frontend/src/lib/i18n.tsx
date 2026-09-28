"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Dictionaries
const en = {
  "nav.home": "Home",
  "nav.schemes": "Schemes",
  "nav.about": "About",
  "auth.login": "Login",
  "auth.register": "Register",
  "application.personal_details": "Personal Details",
  "application.academic_details": "Academic Details",
  "application.documents": "Documents",
  "verification.ai_assists": "AI Assists",
  "verification.rules_govern": "Rules Govern",
  "verification.officer_decides": "Officer Decides",
  "deficiency.title": "Action Required: Document Deficiency",
  "deficiency.correct_document": "Please upload a corrected version below.",
  "officer.dashboard": "Officer Workspace",
  "officer.pending_review": "Pending Review",
  "officer.request_correction": "Request Correction",
  "common.submit": "Submit",
  "common.loading": "Loading...",
  "common.error": "An error occurred",
  "nav.contact": "Contact",
  "hero.title": "Empowering Scheduled Tribes through Digital Scholarship Intelligence",
  "hero.subtitle": "An explainable, policy-driven verification and lifecycle management platform for MoTA scholarships.",
  "hero.apply": "Apply for Scholarship (NFST/NOS)",
  "hero.track": "Track Application",
  "schemes.featured": "Featured Schemes",
  "scheme.nfst.title": "National Fellowship for ST",
  "scheme.nfst.desc": "Financial assistance for ST students pursuing M.Phil and Ph.D degrees.",
  "scheme.nos.title": "Overseas Scholarship",
  "scheme.nos.desc": "Support for ST students pursuing Master's, Ph.D and Post-Doctoral studies abroad.",
  "scheme.pm.title": "Post-Matric",
  "scheme.pm.desc": "Financial assistance to ST students studying at post-matriculation or post-secondary stage.",
  "scheme.read_guidelines": "Read Guidelines",
  "footer.desc": "A modern platform enabling transparent and efficient verification of scholarship applications for Scheduled Tribes.",
  "footer.compliance": "Compliance",
  "footer.gigw": "GIGW 3.0 Guidelines",
  "footer.accessibility": "Accessibility Statement",
  "footer.screen_reader": "Screen Reader Access",
  "footer.information": "Information",
  "footer.rti": "RTI Declaration",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Use",
};

const hi = {
  "nav.home": "मुख पृष्ठ",
  "nav.schemes": "योजनाएं",
  "nav.about": "हमारे बारे में",
  "auth.login": "लॉग इन करें",
  "auth.register": "पंजीकरण करें",
  "application.personal_details": "व्यक्तिगत विवरण",
  "application.academic_details": "शैक्षणिक विवरण",
  "application.documents": "दस्तावेज़",
  "verification.ai_assists": "AI सहायता",
  "verification.rules_govern": "नियम नियंत्रित करते हैं",
  "verification.officer_decides": "अधिकारी निर्णय लेते हैं",
  "deficiency.title": "कार्रवाई आवश्यक: दस्तावेज़ में कमी",
  "deficiency.correct_document": "कृपया नीचे संशोधित संस्करण अपलोड करें।",
  "officer.dashboard": "अधिकारी कार्यक्षेत्र",
  "officer.pending_review": "समीक्षा लंबित",
  "officer.request_correction": "सुधार का अनुरोध करें",
  "common.submit": "जमा करें",
  "common.loading": "लोड हो रहा है...",
  "common.error": "एक त्रुटि हुई",
  "nav.contact": "संपर्क",
  "hero.title": "डिजिटल छात्रवृत्ति बुद्धिमत्ता के माध्यम से अनुसूचित जनजातियों को सशक्त बनाना",
  "hero.subtitle": "MoTA छात्रवृत्तियों के लिए एक व्याख्यात्मक, नीति-संचालित सत्यापन और जीवनचक्र प्रबंधन मंच।",
  "hero.apply": "छात्रवृत्ति के लिए आवेदन करें (NFST/NOS)",
  "hero.track": "आवेदन ट्रैक करें",
  "schemes.featured": "प्रमुख योजनाएं",
  "scheme.nfst.title": "एसटी के लिए राष्ट्रीय फैलोशिप",
  "scheme.nfst.desc": "एम.फिल और पीएच.डी डिग्री प्राप्त करने वाले एसटी छात्रों के लिए वित्तीय सहायता।",
  "scheme.nos.title": "विदेशी छात्रवृत्ति",
  "scheme.nos.desc": "विदेश में मास्टर, पीएच.डी और पोस्ट-डॉक्टरल अध्ययन करने वाले एसटी छात्रों के लिए समर्थन।",
  "scheme.pm.title": "पोस्ट-मैट्रिक",
  "scheme.pm.desc": "पोस्ट-मैट्रिकुलेशन या पोस्ट-सेकेंडरी स्तर पर पढ़ने वाले एसटी छात्रों को वित्तीय सहायता।",
  "scheme.read_guidelines": "दिशानिर्देश पढ़ें",
  "footer.desc": "अनुसूचित जनजातियों के लिए छात्रवृत्ति आवेदनों के पारदर्शी और कुशल सत्यापन को सक्षम करने वाला एक आधुनिक मंच।",
  "footer.compliance": "अनुपालन",
  "footer.gigw": "GIGW 3.0 दिशानिर्देश",
  "footer.accessibility": "पहुंच-योग्यता विवरण",
  "footer.screen_reader": "स्क्रीन रीडर एक्सेस",
  "footer.information": "जानकारी",
  "footer.rti": "आरटीआई घोषणा",
  "footer.privacy": "गोपनीयता नीति",
  "footer.terms": "उपयोग की शर्तें",
};

const or = {
  "nav.home": "ମୁଖ୍ୟ ପୃଷ୍ଠା",
  "nav.schemes": "ଯୋଜନାଗୁଡିକ",
  "nav.about": "ଆମ ବିଷୟରେ",
  "auth.login": "ଲଗ୍ ଇନ୍ କରନ୍ତୁ",
  "auth.register": "ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
  "application.personal_details": "ବ୍ୟକ୍ତିଗତ ବିବରଣୀ",
  "application.academic_details": "ଶିକ୍ଷାଗତ ବିବରଣୀ",
  "application.documents": "କାଗଜପତ୍ର",
  "verification.ai_assists": "AI ସହାୟତା କରେ",
  "verification.rules_govern": "ନିୟମ ପରିଚାଳନା କରେ",
  "verification.officer_decides": "ଅଧିକାରୀ ନିଷ୍ପତ୍ତି ନିଅନ୍ତି",
  "deficiency.title": "ଆବଶ୍ୟକ ପଦକ୍ଷେପ: କାଗଜପତ୍ର ଅଭାବ",
  "deficiency.correct_document": "ଦୟାକରି ତଳେ ଏକ ସଂଶୋଧିତ ସଂସ୍କରଣ ଅପଲୋଡ୍ କରନ୍ତୁ |",
  "officer.dashboard": "ଅଧିକାରୀ ଡ୍ୟାସବୋର୍ଡ",
  "officer.pending_review": "ସମୀକ୍ଷା ବାକି ଅଛି",
  "officer.request_correction": "ସଂଶୋଧନ ପାଇଁ ଅନୁରୋଧ",
  "common.submit": "ଦାଖଲ କରନ୍ତୁ",
  "common.loading": "ଲୋଡ୍ ହେଉଛି...",
  "common.error": "ଏକ ତ୍ରୁଟି ଘଟିଲା",
  "nav.contact": "ଯୋଗାଯୋଗ",
  "hero.title": "ଡିଜିଟାଲ୍ ସ୍କଲାରସିପ୍ ଇଣ୍ଟେଲିଜେନ୍ସ ମାଧ୍ୟମରେ ଅନୁସୂଚିତ ଜନଜାତିର ସଶକ୍ତିକରଣ",
  "hero.subtitle": "MoTA ସ୍କଲାରସିପ୍ ପାଇଁ ଏକ ସ୍ପଷ୍ଟ, ନୀତି-ପରିଚାଳିତ ଯାଞ୍ଚ ଏବଂ ଜୀବନଚକ୍ର ପରିଚାଳନା ପ୍ଲାଟଫର୍ମ |",
  "hero.apply": "ବୃତ୍ତି ପାଇଁ ଆବେଦନ କରନ୍ତୁ (NFST / NOS)",
  "hero.track": "ଆବେଦନ ଟ୍ରାକ୍ କରନ୍ତୁ",
  "schemes.featured": "ବୈଶିଷ୍ଟ୍ୟ ଯୁକ୍ତ ଯୋଜନାଗୁଡିକ",
  "scheme.nfst.title": "ଏସଟି ପାଇଁ ଜାତୀୟ ଫେଲୋସିପ୍",
  "scheme.nfst.desc": "ଏମ୍.ଫିଲ୍ ଏବଂ ପିଏଚଡି କରୁଥିବା ଏସଟି ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ ଆର୍ଥିକ ସହାୟତା |",
  "scheme.nos.title": "ବିଦେଶୀ ଛାତ୍ରବୃତ୍ତି",
  "scheme.nos.desc": "ବିଦେଶରେ ମାଷ୍ଟର, ପିଏଚଡି ଏବଂ ପୋଷ୍ଟ-ଡକ୍ଟରାଲ୍ ଅଧ୍ୟୟନ କରୁଥିବା ଏସଟି ଛାତ୍ରଙ୍କ ପାଇଁ ସମର୍ଥନ |",
  "scheme.pm.title": "ମାଟ୍ରିକ୍ ପରବର୍ତ୍ତୀ",
  "scheme.pm.desc": "ମାଟ୍ରିକ୍ ପରବର୍ତ୍ତୀ କିମ୍ବା ପରବର୍ତ୍ତୀ ମାଧ୍ୟମିକ ସ୍ତରରେ ପଢୁଥିବା ଏସଟି ଛାତ୍ରମାନଙ୍କୁ ଆର୍ଥିକ ସହାୟତା |",
  "scheme.read_guidelines": "ଗାଇଡଲାଇନ ପଢନ୍ତୁ",
  "footer.desc": "ଅନୁସୂଚିତ ଜନଜାତିଙ୍କ ପାଇଁ ସ୍କଲାରସିପ୍ ଆବେଦନଗୁଡ଼ିକର ସ୍ୱଚ୍ଛ ଏବଂ ଦକ୍ଷ ଯାଞ୍ଚକୁ ସକ୍ଷମ କରୁଥିବା ଏକ ଆଧୁନିକ ପ୍ଲାଟଫର୍ମ |",
  "footer.compliance": "ଅନୁପାଳନ",
  "footer.gigw": "GIGW 3.0 ନିର୍ଦ୍ଦେଶାବଳୀ",
  "footer.accessibility": "ପ୍ରବେଶ ଯୋଗ୍ୟତା ବିବୃତ୍ତି",
  "footer.screen_reader": "ସ୍କ୍ରିନ୍ ରିଡର୍ ଆକ୍ସେସ୍",
  "footer.information": "ସୂଚନା",
  "footer.rti": "RTI ଘୋଷଣା",
  "footer.privacy": "ଗୋପନୀୟତା ନୀତି",
  "footer.terms": "ବ୍ୟବହାରର ସର୍ତ୍ତାବଳୀ",
};

const bn = {
  "nav.home": "হোম",
  "nav.schemes": "প্রকল্পসমূহ",
  "nav.about": "আমাদের সম্পর্কে",
  "auth.login": "লগইন করুন",
  "auth.register": "নিবন্ধন করুন",
  "application.personal_details": "ব্যক্তিগত বিবরণ",
  "application.academic_details": "শিক্ষাগত বিবরণ",
  "application.documents": "নথিপত্র",
  "verification.ai_assists": "এআই সহায়তা করে",
  "verification.rules_govern": "নিয়ম পরিচালনা করে",
  "verification.officer_decides": "কর্মকর্তা সিদ্ধান্ত নেন",
  "deficiency.title": "পদক্ষেপ প্রয়োজন: নথির ঘাটতি",
  "deficiency.correct_document": "অনুগ্রহ করে নিচে একটি সংশোধিত সংস্করণ আপলোড করুন।",
  "officer.dashboard": "কর্মকর্তার ড্যাশবোর্ড",
  "officer.pending_review": "পর্যালোচনা মুলতুবি",
  "officer.request_correction": "সংশোধনের অনুরোধ করুন",
  "common.submit": "জমা দিন",
  "common.loading": "লোড হচ্ছে...",
  "common.error": "একটি ত্রুটি ঘটেছে",
  "nav.contact": "যোগাযোগ",
  "hero.title": "ডিজিটাল স্কলারশিপ ইন্টেলিজেন্সের মাধ্যমে তফসিলি উপজাতিদের ক্ষমতায়ন",
  "hero.subtitle": "MoTA স্কলারশিপের জন্য একটি ব্যাখ্যামূলক, নীতি-চালিত যাচাইকরণ এবং জীবনচক্র পরিচালনার প্ল্যাটফর্ম।",
  "hero.apply": "বৃত্তির জন্য আবেদন করুন (NFST/NOS)",
  "hero.track": "আবেদন ট্র্যাক করুন",
  "schemes.featured": "বিশিষ্ট প্রকল্পসমূহ",
  "scheme.nfst.title": "এসটিদের জন্য জাতীয় ফেলোশিপ",
  "scheme.nfst.desc": "এম.ফিল এবং পিএইচ.ডি ডিগ্রি অর্জনকারী এসটি শিক্ষার্থীদের জন্য আর্থিক সহায়তা।",
  "scheme.nos.title": "বিদেশী বৃত্তি",
  "scheme.nos.desc": "বিদেশে মাস্টার্স, পিএইচ.ডি এবং পোস্ট-ডক্টরাল অধ্যয়নরত এসটি শিক্ষার্থীদের জন্য সহায়তা।",
  "scheme.pm.title": "পোস্ট-ম্যাট্রিক",
  "scheme.pm.desc": "পোস্ট-ম্যাট্রিকুলেশন বা মাধ্যমিক-পরবর্তী স্তরে অধ্যয়নরত এসটি শিক্ষার্থীদের আর্থিক সহায়তা।",
  "scheme.read_guidelines": "নির্দেশিকা পড়ুন",
  "footer.desc": "তফসিলি উপজাতিদের স্কলারশিপ আবেদনের স্বচ্ছ ও কার্যকর যাচাইকরণ সক্ষমকারী একটি আধুনিক প্ল্যাটফর্ম।",
  "footer.compliance": "সম্মতি",
  "footer.gigw": "GIGW 3.0 নির্দেশিকা",
  "footer.accessibility": "অ্যাক্সেসযোগ্যতার বিবৃতি",
  "footer.screen_reader": "স্ক্রিন রিডার অ্যাক্সেস",
  "footer.information": "তথ্য",
  "footer.rti": "RTI ঘোষণা",
  "footer.privacy": "গোপনীয়তা নীতি",
  "footer.terms": "ব্যবহারের শর্তাবলী",
};

const kn = {
  "nav.home": "ಮುಖಪುಟ",
  "nav.schemes": "ಯೋಜನೆಗಳು",
  "nav.about": "ನಮ್ಮ ಬಗ್ಗೆ",
  "auth.login": "ಲಾಗಿನ್",
  "auth.register": "ನೋಂದಣಿ",
  "application.personal_details": "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
  "application.academic_details": "ಶೈಕ್ಷಣಿಕ ವಿವರಗಳು",
  "application.documents": "ದಾಖಲೆಗಳು",
  "verification.ai_assists": "AI ಸಹಾಯ ಮಾಡುತ್ತದೆ",
  "verification.rules_govern": "ನಿಯಮಗಳು ಆಳುತ್ತವೆ",
  "verification.officer_decides": "ಅಧಿಕಾರಿ ನಿರ್ಧರಿಸುತ್ತಾರೆ",
  "deficiency.title": "ಕ್ರಮ ಅಗತ್ಯವಿದೆ: ದಾಖಲೆ ಕೊರತೆ",
  "deficiency.correct_document": "ದಯವಿಟ್ಟು ಕೆಳಗೆ ಸರಿಪಡಿಸಿದ ಆವೃತ್ತಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
  "officer.dashboard": "ಅಧಿಕಾರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  "officer.pending_review": "ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ",
  "officer.request_correction": "ತಿದ್ದುಪಡಿಗೆ ವಿನಂತಿಸಿ",
  "common.submit": "ಸಲ್ಲಿಸಿ",
  "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
  "common.error": "ದೋಷ ಸಂಭವಿಸಿದೆ",
  "nav.contact": "ಸಂಪರ್ಕಿಸಿ",
  "hero.title": "ಡಿಜಿಟಲ್ ವಿದ್ಯಾರ್ಥಿವೇತನ ಗುಪ್ತಚರ ಮೂಲಕ ಪರಿಶಿಷ್ಟ ಪಂಗಡಗಳ ಸಬಲೀಕರಣ",
  "hero.subtitle": "MoTA ವಿದ್ಯಾರ್ಥಿವೇತನಗಳಿಗಾಗಿ ವಿವರಿಸಬಲ್ಲ, ನೀತಿ-ಚಾಲಿತ ಪರಿಶೀಲನೆ ಮತ್ತು ಜೀವನಚಕ್ರ ನಿರ್ವಹಣಾ ವೇದಿಕೆ.",
  "hero.apply": "ವಿದ್ಯಾರ್ಥಿವೇತನಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ (NFST/NOS)",
  "hero.track": "ಅರ್ಜಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
  "schemes.featured": "ವೈಶಿಷ್ಟ್ಯಪೂರ್ಣ ಯೋಜನೆಗಳು",
  "scheme.nfst.title": "ಎಸ್ಟಿಗಳಿಗಾಗಿ ರಾಷ್ಟ್ರೀಯ ಫೆಲೋಶಿಪ್",
  "scheme.nfst.desc": "ಎಂ.ಫಿಲ್ ಮತ್ತು ಪಿಎಚ್.ಡಿ ಪದವಿ ಪಡೆಯುತ್ತಿರುವ ಎಸ್ಟಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಆರ್ಥಿಕ ನೆರವು.",
  "scheme.nos.title": "ಸಾಗರೋತ್ತರ ವಿದ್ಯಾರ್ಥಿವೇತನ",
  "scheme.nos.desc": "ವಿದೇಶದಲ್ಲಿ ಸ್ನಾತಕೋತ್ತರ, ಪಿಎಚ್.ಡಿ ಮತ್ತು ಪೋಸ್ಟ್-ಡಾಕ್ಟರಲ್ ಅಧ್ಯಯನ ಮಾಡುತ್ತಿರುವ ಎಸ್ಟಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಬೆಂಬಲ.",
  "scheme.pm.title": "ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್",
  "scheme.pm.desc": "ಮೆಟ್ರಿಕ್ಯುಲೇಷನ್ ನಂತರದ ಅಥವಾ ಪ್ರೌಢಶಾಲೆಯ ನಂತರದ ಹಂತದಲ್ಲಿ ಓದುತ್ತಿರುವ ಎಸ್ಟಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಆರ್ಥಿಕ ನೆರವು.",
  "scheme.read_guidelines": "ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಓದಿ",
  "footer.desc": "ಪರಿಶಿಷ್ಟ ಪಂಗಡಗಳ ವಿದ್ಯಾರ್ಥಿವೇತನ ಅರ್ಜಿಗಳ ಪಾರದರ್ಶಕ ಮತ್ತು ಪರಿಣಾಮಕಾರಿ ಪರಿಶೀಲನೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುವ ಆಧುನಿಕ ವೇದಿಕೆ.",
  "footer.compliance": "ಅನುವರ್ತನೆ",
  "footer.gigw": "GIGW 3.0 ಮಾರ್ಗಸೂಚಿಗಳು",
  "footer.accessibility": "ಪ್ರವೇಶಿಸುವಿಕೆ ಹೇಳಿಕೆ",
  "footer.screen_reader": "ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಪ್ರವೇಶ",
  "footer.information": "ಮಾಹಿತಿ",
  "footer.rti": "ಆರ್ಟಿಐ ಘೋಷಣೆ",
  "footer.privacy": "ಗೌಪ್ಯತೆ ನೀತಿ",
  "footer.terms": "ಬಳಕೆಯ ನಿಯಮಗಳು",
};

const sat = {
  "nav.home": "ᱚᱲᱟᱜ",
  "nav.schemes": "ᱡᱚᱡᱚᱱᱟᱠᱚ",
  "nav.about": "ᱟᱵᱚ ᱵᱟᱵᱚᱛ ᱛᱮ",
  "auth.login": "ᱵᱚᱞᱚᱱ ᱢᱮ",
  "auth.register": "ᱨᱮᱡᱤᱥᱴᱟᱨ ᱢᱮ",
  "application.personal_details": "ᱟᱯᱱᱟᱨ ᱵᱤᱵᱚᱨᱚᱱ",
  "application.academic_details": "ᱯᱟᱲᱦᱟᱣ ᱵᱤᱵᱚᱨᱚᱱ",
  "application.documents": "ᱠᱟᱜᱚᱡᱽ ᱠᱚ",
  "verification.ai_assists": "AI ᱜᱚᱲᱚ ᱮᱢᱚᱜᱼᱟ",
  "verification.rules_govern": "ᱱᱤᱭᱟᱹᱢ ᱪᱟᱞᱟᱣᱟ",
  "verification.officer_decides": "ᱚᱯᱷᱤᱥᱚᱨ ᱜᱚᱴᱟᱭᱟ",
  "deficiency.title": "ᱠᱟᱹᱢᱤ ᱞᱟᱹᱠᱛᱤ: ᱠᱟᱜᱚᱡᱽ ᱠᱚᱢᱤ",
  "deficiency.correct_document": "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱞᱟᱛᱟᱨ ᱨᱮ ᱴᱷᱤᱠᱟᱹ ᱠᱟᱜᱚᱡᱽ ᱮᱢ ᱢᱮ᱾",
  "officer.dashboard": "ᱚᱯᱷᱤᱥᱚᱨ ᱰᱮᱥᱵᱚᱨᱰ",
  "officer.pending_review": "ᱧᱮᱞ ᱵᱟᱹᱠᱤ ᱢᱮᱱᱟᱜᱼᱟ",
  "officer.request_correction": "ᱥᱩᱫᱷᱨᱟᱹᱣ ᱞᱟᱹᱜᱤᱫ ᱱᱮᱦᱚᱨ",
  "common.submit": "ᱡᱚᱢᱟ ᱢᱮ",
  "common.loading": "ᱞᱚᱰᱤᱝ...",
  "common.error": "ᱮᱴᱠᱮᱴᱚᱬᱮ ᱦᱩᱭ ᱮᱱᱟ",
  "nav.contact": "ᱥᱟᱹᱜᱟᱹᱭ",
  "hero.title": "ᱰᱤᱡᱤᱴᱟᱞ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱤᱱᱴᱮᱞᱤᱡᱮᱱᱥ ᱦᱚᱛᱮᱛᱮ ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱠᱚ ᱫᱟᱲᱮᱭᱟᱱ ᱵᱮᱱᱟᱣ",
  "hero.subtitle": "ᱢᱳᱴᱟ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱞᱟᱹᱜᱤᱫ ᱢᱤᱫ ᱵᱩᱡᱷᱟᱹᱣᱟᱱ, ᱱᱤᱭᱟᱹᱢ ᱪᱟᱪᱞᱟᱣ ᱯᱚᱨᱢᱟᱱ ᱟᱨ ᱡᱤᱭᱚᱱ ᱪᱟᱠᱨᱚ ᱢᱮᱱᱮᱡᱽᱢᱮᱱᱴ ᱯᱞᱟᱴᱯᱷᱚᱨᱢ᱾",
  "hero.apply": "ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱞᱟᱹᱜᱤᱫ ᱟᱯᱞᱟᱭ ᱢᱮ (NFST/NOS)",
  "hero.track": "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱴᱨᱮᱠ ᱢᱮ",
  "schemes.featured": "ᱧᱩᱛᱩᱢᱟᱱ ᱡᱚᱡᱚᱱᱟᱠᱚ",
  "scheme.nfst.title": "ᱮᱥᱴᱤ ᱞᱟᱹᱜᱤᱫ ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱯᱷᱮᱞᱚᱥᱤᱯ",
  "scheme.nfst.desc": "ᱮᱢ.ᱯᱷᱤᱞ ᱟᱨ ᱯᱤ.ᱮᱭᱤᱪ.ᱰᱤ ᱯᱟᱲᱦᱟᱜ ᱠᱟᱱ ᱮᱥᱴᱤ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱹᱣᱰᱤ ᱜᱚᱲᱚ᱾",
  "scheme.nos.title": "ᱵᱤᱫᱮᱥ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ",
  "scheme.nos.desc": "ᱵᱤᱫᱮᱥ ᱨᱮ ᱢᱟᱥᱴᱟᱨ, ᱯᱤ.ᱮᱭᱤᱪ.ᱰᱤ ᱟᱨ ᱯᱚᱥᱴ-ᱰᱚᱠᱴᱚᱨᱟᱞ ᱯᱟᱲᱦᱟᱜ ᱠᱟᱱ ᱮᱥᱴᱤ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱜᱚᱲᱚ᱾",
  "scheme.pm.title": "ᱯᱚᱥᱴ-ᱢᱮᱴᱨᱤᱠ",
  "scheme.pm.desc": "ᱯᱚᱥᱴ-ᱢᱮᱴᱨᱤᱠ ᱥᱮ ᱥᱮᱠᱮᱱᱰᱟᱨᱤ ᱛᱟᱭᱚᱢ ᱯᱟᱲᱦᱟᱜ ᱠᱟᱱ ᱮᱥᱴᱤ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱹᱣᱰᱤ ᱜᱚᱲᱚ᱾",
  "scheme.read_guidelines": "ᱫᱤᱥᱟᱹ ᱩᱫᱩᱜ ᱯᱟᱲᱦᱟᱣ ᱢᱮ",
  "footer.desc": "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱨᱮᱱᱟᱜ ᱯᱷᱟᱨᱪᱟ ᱟᱨ ᱱᱟᱯᱟᱭ ᱯᱚᱨᱢᱟᱱ ᱞᱟᱹᱜᱤᱫ ᱢᱤᱫ ᱱᱟᱣᱟ ᱯᱞᱟᱴᱯᱷᱚᱨᱢ᱾",
  "footer.compliance": "ᱟᱸᱡᱚᱢ ᱢᱟᱱᱟᱣ",
  "footer.gigw": "GIGW 3.0 ᱫᱤᱥᱟᱹ ᱩᱫᱩᱜ",
  "footer.accessibility": "ᱥᱮᱴᱮᱨ ᱫᱟᱲᱮᱭᱟᱜ ᱠᱟᱛᱷᱟ",
  "footer.screen_reader": "ᱥᱠᱨᱤᱱ ᱨᱤᱰᱟᱨ ᱟᱠᱥᱮᱥ",
  "footer.information": "ᱵᱟᱰᱟᱭ ᱠᱟᱛᱷᱟ",
  "footer.rti": "ᱟᱨ.ᱴᱤ.ᱟᱭ ᱜᱷᱚᱥᱱᱟ",
  "footer.privacy": "ᱯᱨᱟᱭᱵᱷᱮᱥᱤ ᱯᱚᱞᱤᱥᱤ",
  "footer.terms": "ᱵᱮᱵᱷᱟᱨ ᱨᱮᱱᱟᱜ ᱥᱚᱨᱛᱚ",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dictionaries: any = { en, hi, or, bn, kn, sat };

type Locale = 'en' | 'hi' | 'or' | 'bn' | 'kn' | 'sat';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('nirikshak_locale');
    if (savedLocale && dictionaries[savedLocale]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(savedLocale as Locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('nirikshak_locale', newLocale);
  };

  const t = (key: string): string => {
    return dictionaries[locale][key] || dictionaries['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
