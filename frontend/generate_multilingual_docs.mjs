import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve('../dataset/multilingual');
const DOCS_DIR = path.join(BASE_DIR, 'documents');
const GT_DIR = path.join(BASE_DIR, 'ground_truth');

// Utility to write Ground Truth
function writeGroundTruth(docId, docType, lang, fields) {
  const gt = {
    document_id: docId,
    document_type: docType,
    language: lang,
    fields: fields
  };
  fs.writeFileSync(path.join(GT_DIR, `${docId}.json`), JSON.stringify(gt, null, 2));
}

// Write Metadata
const allMetadata = [];

function writeMetadata(docId, docType, lang, script, state, formatRefId, isNoisy) {
  allMetadata.push({
    document_id: docId,
    document_type: docType,
    language: lang,
    script: script,
    state: state,
    format_reference_id: formatRefId,
    source_type: "official_government_format",
    synthetic: true,
    contains_real_personal_data: false,
    ground_truth_id: `GT-${docId}`,
    quality: isNoisy ? "NOISY" : "CLEAN"
  });
}

// Document templates (HTML)
const templates = {
  or: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: ${isNoisy ? '#444' : '#000'}; background: ${isNoisy ? '#f9f9f9' : '#fff'}; transform: ${isNoisy ? 'rotate(1deg)' : 'none'};">
        <h1 style="text-align: center;">ଓଡ଼ିଶା ସରକାର</h1>
        <h2 style="text-align: center;">ଆୟ ପ୍ରମାଣପତ୍ର (Income Certificate)</h2>
        <hr/>
        <p>ପ୍ରମାଣପତ୍ର ସଂଖ୍ୟା: <strong>${fields.certificate_number}</strong></p>
        <p>ତାରିଖ: <strong>${fields.issue_date}</strong></p>
        <p>ଆବେଦନକାରୀଙ୍କ ନାମ: <strong>${fields.applicant_name}</strong></p>
        <p>ଜିଲ୍ଲା: <strong>${fields.district}</strong></p>
        <p>ରାଜ୍ୟ: <strong>${fields.state}</strong></p>
        <p>ବାର୍ଷିକ ଆୟ: <strong>${fields.annual_income}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `,
  hi: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: ${isNoisy ? '#333' : '#000'}; background: ${isNoisy ? '#fafafa' : '#fff'}; transform: ${isNoisy ? 'rotate(-1deg)' : 'none'};">
        <h1 style="text-align: center;">झारखंड सरकार</h1>
        <h2 style="text-align: center;">जाति प्रमाण पत्र (Caste Certificate)</h2>
        <hr/>
        <p>प्रमाण पत्र संख्या: <strong>${fields.certificate_number}</strong></p>
        <p>दिनांक: <strong>${fields.issue_date}</strong></p>
        <p>आवेदक का नाम: <strong>${fields.applicant_name}</strong></p>
        <p>जाति: <strong>${fields.caste}</strong></p>
        <p>ज़िला: <strong>${fields.district}</strong></p>
        <p>राज्य: <strong>${fields.state}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `,
  kn: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: ${isNoisy ? '#444' : '#000'}; background: ${isNoisy ? '#fefefe' : '#fff'}; transform: ${isNoisy ? 'rotate(0.5deg)' : 'none'};">
        <h1 style="text-align: center;">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
        <h2 style="text-align: center;">ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ (Income Certificate)</h2>
        <hr/>
        <p>ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ: <strong>${fields.certificate_number}</strong></p>
        <p>ದಿನಾಂಕ: <strong>${fields.issue_date}</strong></p>
        <p>ಅರ್ಜಿದಾರರ ಹೆಸರು: <strong>${fields.applicant_name}</strong></p>
        <p>ಜಿಲ್ಲೆ: <strong>${fields.district}</strong></p>
        <p>ರಾಜ್ಯ: <strong>${fields.state}</strong></p>
        <p>ವಾರ್ಷಿಕ ಆದಾಯ: <strong>${fields.annual_income}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `,
  bn: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px; color: ${isNoisy ? '#333' : '#000'}; background: ${isNoisy ? '#f0f0f0' : '#fff'};">
        <h1 style="text-align: center;">পশ্চিমবঙ্গ সরকার</h1>
        <h2 style="text-align: center;">বাসিন্দা শংসাপত্র (Domicile Certificate)</h2>
        <hr/>
        <p>শংসাপত্র নম্বর: <strong>${fields.certificate_number}</strong></p>
        <p>তারিখ: <strong>${fields.issue_date}</strong></p>
        <p>আবেদনকারীর নাম: <strong>${fields.applicant_name}</strong></p>
        <p>জেলা: <strong>${fields.district}</strong></p>
        <p>রাজ্য: <strong>${fields.state}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sat: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1 style="text-align: center;">Tribal Welfare Department</h1>
        <h2 style="text-align: center;">Bonafide Certificate (ᱥᱟᱹᱨᱤ ᱯᱨᱚᱢᱟᱱ ᱯᱚᱛᱨᱚ)</h2>
        <hr/>
        <p>Certificate No: <strong>${fields.certificate_number}</strong></p>
        <p>Date: <strong>${fields.issue_date}</strong></p>
        <p>Name: <strong>${fields.applicant_name}</strong></p>
        <p>District: <strong>${fields.district}</strong></p>
        <p>State: <strong>${fields.state}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `,
  en: (fields, isNoisy) => `
    <html>
      <body style="font-family: sans-serif; padding: 40px; filter: ${isNoisy ? 'blur(0.5px)' : 'none'};">
        <h1 style="text-align: center;">Board of Education</h1>
        <h2 style="text-align: center;">MARKSHEET</h2>
        <hr/>
        <p>Roll No: <strong>${fields.certificate_number}</strong></p>
        <p>Date: <strong>${fields.issue_date}</strong></p>
        <p>Student Name: <strong>${fields.applicant_name}</strong></p>
        <p>Institution: <strong>${fields.institution}</strong></p>
        <p>Percentage: <strong>${fields.percentage}</strong></p>
        <br/><br/>
        <p style="color: red; font-size: 10px;">SYNTHETIC DOCUMENT - FOR TESTING ONLY</p>
      </body>
    </html>
  `
};

const syntheticData = {
  or: [
    { applicant_name: "ରାମଚନ୍ଦ୍ର ଦାସ", certificate_number: "INC/2026/001", issue_date: "2026-05-10", district: "ଖୋର୍ଦ୍ଧା", state: "ଓଡ଼ିଶା", annual_income: "₹45,000" },
    { applicant_name: "ସୀତା ପଣ୍ଡା", certificate_number: "INC/2026/002", issue_date: "2026-06-15", district: "କଟକ", state: "ଓଡ଼ିଶା", annual_income: "₹60,000" },
    { applicant_name: "ହରି ମିଶ୍ର", certificate_number: "INC/2026/003", issue_date: "2026-01-20", district: "ପୁରୀ", state: "ଓଡ଼ିଶା", annual_income: "₹50,000" },
    { applicant_name: "ଅନିଲ କୁମାର ମହାନ୍ତି", certificate_number: "INC/2026/004", issue_date: "2026-03-05", district: "ବାଲେଶ୍ୱର", state: "ଓଡ଼ିଶା", annual_income: "₹75,000" },
    { applicant_name: "ମନୋଜ ସାହୁ", certificate_number: "INC/2026/005", issue_date: "2026-07-22", district: "ଭଦ୍ରକ", state: "ଓଡ଼ିଶା", annual_income: "₹35,000" }
  ],
  hi: [
    { applicant_name: "रमेश कुमार", certificate_number: "CST/JH/001", issue_date: "2026-04-12", caste: "ST (Munda)", district: "रांची", state: "झारखंड" },
    { applicant_name: "सुनीता मुंडा", certificate_number: "CST/JH/002", issue_date: "2026-02-18", caste: "ST (Munda)", district: "खूंटी", state: "झारखंड" },
    { applicant_name: "अमित उरांव", certificate_number: "CST/JH/003", issue_date: "2026-08-09", caste: "ST (Oraon)", district: "गुमला", state: "झारखंड" },
    { applicant_name: "दिनेश सोरेन", certificate_number: "CST/JH/004", issue_date: "2026-05-30", caste: "ST (Santhal)", district: "दुमका", state: "झारखंड" },
    { applicant_name: "पूजा कुमारी", certificate_number: "CST/JH/005", issue_date: "2026-09-11", caste: "SC", district: "पलामू", state: "झारखंड" }
  ],
  kn: [
    { applicant_name: "ರಾಹುಲ್ ಗೌಡ", certificate_number: "INC/KA/101", issue_date: "2026-03-14", district: "ಬೆಂಗಳೂರು", state: "ಕರ್ನಾಟಕ", annual_income: "₹50,000" },
    { applicant_name: "ಕವಿತಾ ಪಾಟೀಲ್", certificate_number: "INC/KA/102", issue_date: "2026-07-02", district: "ಮೈಸೂರು", state: "ಕರ್ನಾಟಕ", annual_income: "₹45,000" },
    { applicant_name: "ಮಹೇಶ್ ಕುಮಾರ್", certificate_number: "INC/KA/103", issue_date: "2026-08-21", district: "ಮಂಗಳೂರು", state: "ಕರ್ನಾಟಕ", annual_income: "₹80,000" },
    { applicant_name: "ಅನಿಲ್ ಶರ್ಮಾ", certificate_number: "INC/KA/104", issue_date: "2026-01-10", district: "ಧಾರವಾಡ", state: "ಕರ್ನಾಟಕ", annual_income: "₹65,000" },
    { applicant_name: "ಶೃತಿ ನಾಯಕ್", certificate_number: "INC/KA/105", issue_date: "2026-04-05", district: "ಬೆಳಗಾವಿ", state: "ಕರ್ನಾಟಕ", annual_income: "₹30,000" }
  ],
  bn: [
    { applicant_name: "অমিত ঘোষ", certificate_number: "DOM/WB/201", issue_date: "2026-05-20", district: "কলকাতা", state: "পশ্চিমবঙ্গ" },
    { applicant_name: "সুমন চ্যাটার্জী", certificate_number: "DOM/WB/202", issue_date: "2026-06-11", district: "হাওড়া", state: "পশ্চিমবঙ্গ" },
    { applicant_name: "রিতু সেন", certificate_number: "DOM/WB/203", issue_date: "2026-02-15", district: "দার্জিলিং", state: "পশ্চিমবঙ্গ" },
    { applicant_name: "রাহুল দাস", certificate_number: "DOM/WB/204", issue_date: "2026-09-01", district: "বর্ধমান", state: "পশ্চিমবঙ্গ" },
    { applicant_name: "প্রিয়াঙ্কা মিত্র", certificate_number: "DOM/WB/205", issue_date: "2026-03-25", district: "মালদা", state: "পশ্চিমবঙ্গ" }
  ],
  sat: [
    { applicant_name: "Somnath Murmu", certificate_number: "BON/SAT/301", issue_date: "2026-01-12", district: "Dumka", state: "Jharkhand" },
    { applicant_name: "Baha Tudu", certificate_number: "BON/SAT/302", issue_date: "2026-02-15", district: "Pakur", state: "Jharkhand" },
    { applicant_name: "Sunaram Soren", certificate_number: "BON/SAT/303", issue_date: "2026-03-10", district: "Sahibganj", state: "Jharkhand" },
    { applicant_name: "Muni Hembram", certificate_number: "BON/SAT/304", issue_date: "2026-04-05", district: "Godda", state: "Jharkhand" },
    { applicant_name: "Ramesh Hansda", certificate_number: "BON/SAT/305", issue_date: "2026-05-22", district: "Jamtara", state: "Jharkhand" }
  ],
  en: [
    { applicant_name: "John Doe", certificate_number: "MRK/EN/401", issue_date: "2026-06-10", institution: "XYZ College", percentage: "85%" },
    { applicant_name: "Jane Smith", certificate_number: "MRK/EN/402", issue_date: "2026-06-12", institution: "ABC University", percentage: "78%" },
    { applicant_name: "Alice Brown", certificate_number: "MRK/EN/403", issue_date: "2026-06-15", institution: "LMN Institute", percentage: "92%" },
    { applicant_name: "Bob White", certificate_number: "MRK/EN/404", issue_date: "2026-06-18", institution: "PQR College", percentage: "65%" },
    { applicant_name: "Charlie Green", certificate_number: "MRK/EN/405", issue_date: "2026-06-20", institution: "DEF University", percentage: "88%" }
  ]
};

const configMap = {
  or: { type: "INCOME_CERTIFICATE", script: "Oriya", state: "Odisha", ref: "REF-OD-INC-01" },
  hi: { type: "CASTE_CERTIFICATE", script: "Devanagari", state: "Jharkhand", ref: "REF-JH-CASTE-01" },
  kn: { type: "INCOME_CERTIFICATE", script: "Kannada", state: "Karnataka", ref: "REF-KA-INC-01" },
  bn: { type: "DOMICILE_CERTIFICATE", script: "Bengali", state: "West Bengal", ref: "REF-WB-DOM-01" },
  sat: { type: "BONAFIDE_CERTIFICATE", script: "Ol Chiki / Latin", state: "Jharkhand", ref: "REF-SAT-BON-01" },
  en: { type: "MARKSHEET", script: "Latin", state: "National", ref: "REF-EN-MARK-01" }
};

async function generate() {
  console.log("Starting PDF generation via Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let globalCounter = 1;
  
  for (const lang of Object.keys(syntheticData)) {
    console.log("Generating for language: " + lang);
    const records = syntheticData[lang];
    const conf = configMap[lang];
    
    // Generate 12 docs per language by mixing qualities (Total: 6 langs * 12 = 72 docs)
    // 5 unique records * 2 (Clean, Noisy) = 10, plus 2 duplicates for testing cross-validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let docCount = 1;
    for (const rec of records) {
      for (const isNoisy of [false, true]) {
        const docId = `S3-${lang.toUpperCase()}-${String(globalCounter).padStart(3, '0')}`;
        
        const html = templates[lang](rec, isNoisy);
        await page.setContent(html);
        const pdfPath = path.join(DOCS_DIR, lang, `${docId}.pdf`);
        await page.pdf({ path: pdfPath, format: 'A4' });
        
        writeGroundTruth(docId, conf.type, lang, rec);
        writeMetadata(docId, conf.type, lang, conf.script, conf.state, conf.ref, isNoisy);
        
        globalCounter++;
      }
    }
  }

  await browser.close();
  
  fs.writeFileSync(path.join(BASE_DIR, 'metadata', 'documents_metadata.json'), JSON.stringify(allMetadata, null, 2));
  console.log("Completed generation of 60 multilingual PDFs.");
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
