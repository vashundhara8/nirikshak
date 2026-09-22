import { OfficerVerificationDocket, PortalNotice } from "@/types/scholarship";

export const mockPortalNotices: PortalNotice[] = [
  {
    id: "NTC-01",
    date: "20 Aug 2026",
    category: "Urgent",
    title:
      "Mandatory Aadhaar Seeding: Direct Benefit Transfer (DBT) requires student bank accounts to be seeded with Aadhaar via NPCI mapper before 15 Oct 2026.",
    linkText: "Check Bank Mapping Status",
    isNew: true,
  },
  {
    id: "NTC-02",
    date: "15 Aug 2026",
    category: "General",
    title:
      "Extension of Application Timelines: Online registration for Post-Matric Scholarship Scheme (PMS-ST) for Academic Year 2025-26 extended up to 30 Sep 2026.",
    linkText: "Read Gazette Notification",
    isNew: true,
  },
  {
    id: "NTC-03",
    date: "01 Aug 2026",
    category: "Guidelines",
    title:
      "Revised Income Certification Norms: Revenue authorities circular detailing competent issuing ranks (Tehsildar / SDO) and validity provisions.",
    linkText: "Download Circular PDF",
    isNew: false,
  },
  {
    id: "NTC-04",
    date: "22 Jul 2026",
    category: "Scheme Update",
    title:
      "National Overseas Scholarship (NOS-ST) Selection List for 2025-26 Batch 1 published for candidate verification.",
    linkText: "View Candidate List",
    isNew: false,
  },
];

export const mockOfficerDockets: OfficerVerificationDocket[] = [
  {
    id: "DCK-001",
    applicationId: "APP-2026-001",
    applicantName: "Anaya Soren",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "Post-Matric Scholarship for ST Students (PMS-ST)",
    schemeCode: "MOTA-ST-PMS-2025",
    academicYear: "2025-2026",
    institutionName: "Government Engineering College, Ranchi",
    courseName: "B.Tech Computer Science (Sem IV)",
    currentStage: "Deficiency Raised",
    submissionDate: "14 Aug 2026",
    priority: "Normal",
    evidence: {
      fieldOrDocument: "Annual Family Income Certificate",
      sourceDocument: "income_cert_tehsildar_fy25.pdf",
      documentId: "DOC-003",
      extractedValue: "Issuance Date: 12-Feb-2024 (Assessment Year / FY 2023-2024); Stated Income: ₹1,80,000 p.a.",
      declaredValue: "Current FY 2024-2025 validity; Stated Income: ₹1,80,000 p.a.",
      registrySource: "DigiLocker / State Revenue Certificate Registry",
      verificationStatus: "Deficiency",
    },
    policyCheck: {
      ruleCode: "RULE-MOTA-INC-4.2",
      ruleTitle: "Income Certificate Validity & Competent Issuance",
      expectedRequirement:
        "Certificate must correspond to the Financial Year immediately preceding the current academic session (issued on or after 01-Apr-2025 by Tehsildar or higher rank).",
      actualEvidence:
        "Certificate was issued on 12-Feb-2024, reflecting FY 2023-24 financial period.",
      policyVersion: "PMS-ST-2025-v2.3",
      gazetteClause: "Clause 4.2.1, Centrally Sponsored Post-Matric ST Guidelines",
      checkResult: "Discrepancy Detected",
    },
    automatedFinding: {
      summary: "Financial year mismatch detected in submitted Income Certificate",
      assistiveExplanation:
        "The automated verification check cross-referenced document date metadata against the current policy rule. While the income figure (₹1,80,000) is within the statutory ceiling of ₹2,50,000, the certificate date is expired for the 2025-26 session. Requires statutory officer review.",
      severity: "warning",
    },
    auditTrail: [
      {
        timestamp: "21 Aug 2026, 03:00 PM",
        action: "Deficiency Notice Dispatched to Applicant (15-day rectification window)",
        actor: "Officer P. K. Murmu (District Welfare Officer)",
        notes: "Requested updated certificate for FY 2024-25.",
      },
      {
        timestamp: "18 Aug 2026, 02:15 PM",
        action: "Automated Evidence Cross-Check Completed",
        actor: "Verification Processing Service",
        notes: "Matched Caste Registry; Flagged Income FY mismatch.",
      },
      {
        timestamp: "14 Aug 2026, 06:40 PM",
        action: "Application Ingested from NSP Gateway",
        actor: "NSP System Gateway",
      },
    ],
  },
  {
    id: "DCK-002",
    applicationId: "APP-2026-002",
    applicantName: "Devendra Marandi",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "National Overseas Scholarship for ST Candidates (NOS-ST)",
    schemeCode: "MOTA-ST-NOS-2025",
    academicYear: "2025-2026",
    institutionName: "University of Edinburgh, United Kingdom",
    courseName: "M.Sc Renewable Energy Engineering",
    currentStage: "Under Officer Review",
    submissionDate: "16 Aug 2026",
    priority: "Priority Review",
    evidence: {
      fieldOrDocument: "Unconditional Admission Offer & QS Ranking",
      sourceDocument: "edinburgh_unconditional_offer_signed.pdf",
      documentId: "DOC-102",
      extractedValue: "University of Edinburgh; Tuition Fee: £26,500; Verified QS World Rank #27",
      declaredValue: "Tuition Fee: £26,500; Course Start: September 2026",
      registrySource: "Direct University Registrar API & QS Global Institution Index",
      verificationStatus: "Verified",
    },
    policyCheck: {
      ruleCode: "RULE-NOS-ST-3.1",
      ruleTitle: "Institution Ranking & Mandatory Unconditional Admission",
      expectedRequirement:
        "Applicant must possess an unconditional offer of admission in an institution ranked within Top 500 in QS World University Rankings.",
      actualEvidence:
        "University of Edinburgh is ranked #27 in the 2025-26 QS World University Rankings.",
      policyVersion: "NOS-ST-2025-v1.4",
      gazetteClause: "Section 3, Clause 1, NOS Scheme Guidelines",
      checkResult: "Compliant",
    },
    automatedFinding: {
      summary: "All statutory criteria satisfied; ready for officer sanction confirmation",
      assistiveExplanation:
        "Cross-verification with university admissions registry and QS index confirms full compliance. Candidate family income is within ceiling. Awaiting final officer sanction docket sign-off.",
      severity: "info",
    },
    auditTrail: [
      {
        timestamp: "22 Aug 2026, 09:15 AM",
        action: "Docket Placed in Officer Review Queue",
        actor: "Workflow Controller",
      },
      {
        timestamp: "20 Aug 2026, 03:40 PM",
        action: "Foreign University Credential Validation Succeeded",
        actor: "Foreign Credential Service",
      },
    ],
  },
  {
    id: "DCK-003",
    applicationId: "APP-2026-003",
    applicantName: "Ritu Gagrai",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "National Fellowship for Higher Education of ST Students",
    schemeCode: "MOTA-ST-NF-2025",
    academicYear: "2025-2026",
    institutionName: "Indian Institute of Science, Bangalore",
    courseName: "Ph.D. Ecological Sciences (Year 1)",
    currentStage: "Under Institute Verification",
    submissionDate: "18 Aug 2026",
    priority: "Normal",
    evidence: {
      fieldOrDocument: "UGC-NET / JRF Score Verification",
      sourceDocument: "ugc_net_jrf_award_letter_2025.pdf",
      documentId: "DOC-204",
      extractedValue: "Roll: JH048291; Category: ST; Percentile: 98.4%; Session: Dec 2024",
      declaredValue: "JRF Qualified Dec 2024 session",
      registrySource: "National Testing Agency (NTA) Official Verification Gateway",
      verificationStatus: "Verified",
    },
    policyCheck: {
      ruleCode: "RULE-NF-ST-5.0",
      ruleTitle: "Mandatory JRF Qualification for Fellowship Award",
      expectedRequirement:
        "Candidate must have qualified UGC-NET-JRF or CSIR-NET-JRF within the designated eligibility window.",
      actualEvidence: "Award letter authenticity confirmed directly via NTA registry.",
      policyVersion: "NF-ST-2025-v3.0",
      gazetteClause: "Clause 5, National Fellowship Scheme Norms",
      checkResult: "Compliant",
    },
    automatedFinding: {
      summary: "JRF score verified; institute hostel fee schedule confirmation pending",
      assistiveExplanation:
        "Academic qualification fully verified. Institutional registrar verification for residential allowance component is awaiting completion.",
      severity: "info",
    },
    auditTrail: [
      {
        timestamp: "19 Aug 2026, 10:00 AM",
        action: "NTA Registry Cross-Check Succeeded",
        actor: "Verification Processing Service",
      },
    ],
  },
  {
    id: "DCK-004",
    applicationId: "APP-2026-004",
    applicantName: "Sameer Kispotta",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "Post-Matric Scholarship for ST Students (PMS-ST)",
    schemeCode: "MOTA-ST-PMS-2025",
    academicYear: "2025-2026",
    institutionName: "St. Xavier's College, Ranchi",
    courseName: "B.Sc Botany (Honours)",
    currentStage: "Decision Recorded",
    submissionDate: "10 Aug 2026",
    priority: "Normal",
    evidence: {
      fieldOrDocument: "Complete Statutory Document Register (5/5)",
      sourceDocument: "verified_docket_signed_pms.pdf",
      documentId: "DOC-301",
      extractedValue: "Aadhaar e-KYC: Valid | Caste: JharSewa Match | Income: ₹1,40,000 (FY 2024-25)",
      declaredValue: "All statutory criteria satisfied",
      registrySource: "Multi-Source Federated Registry Verification",
      verificationStatus: "Verified",
    },
    policyCheck: {
      ruleCode: "RULE-PMS-ALL",
      ruleTitle: "Comprehensive PMS-ST Eligibility Standards",
      expectedRequirement:
        "Compliance with caste certificate, income ceiling (<= ₹2,50,000 p.a.), and institutional registration.",
      actualEvidence: "All documents meet gazette criteria with zero exceptions.",
      policyVersion: "PMS-ST-2025-v2.3",
      gazetteClause: "Clause 2.1 to 4.5, PMS-ST Guidelines",
      checkResult: "Compliant",
    },
    automatedFinding: {
      summary: "Sanction approved by District Welfare Officer; payment docket queued",
      assistiveExplanation:
        "Application approved by statutory officer. Sanction order dispatched to PFMS for DBT account credit.",
      severity: "info",
    },
    auditTrail: [
      {
        timestamp: "22 Aug 2026, 04:30 PM",
        action: "Sanction Docket Generated and Sent to PFMS",
        actor: "Officer P. K. Murmu (District Welfare Officer)",
      },
      {
        timestamp: "21 Aug 2026, 02:00 PM",
        action: "Officer Approval Recorded",
        actor: "Officer P. K. Murmu (District Welfare Officer)",
      },
    ],
  },
  {
    id: "DCK-005",
    applicationId: "APP-2026-005",
    applicantName: "Kavita Munda",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "Top Class Education Scheme for ST Students",
    schemeCode: "MOTA-ST-TCE-2025",
    academicYear: "2025-2026",
    institutionName: "National Law School of India University, Bengaluru",
    courseName: "B.A. LL.B. (Hons)",
    currentStage: "Deficiency Raised",
    submissionDate: "19 Aug 2026",
    priority: "Normal",
    evidence: {
      fieldOrDocument: "Institutional Fee Schedule & Invoice",
      sourceDocument: "nlsiu_fee_schedule_unstamped_draft.pdf",
      documentId: "DOC-402",
      extractedValue: "Document missing institutional seal and signature of Finance Officer",
      declaredValue: "Tuition Claim: ₹3,20,000",
      registrySource: "Document Integrity Inspection Service",
      verificationStatus: "Deficiency",
    },
    policyCheck: {
      ruleCode: "RULE-TCE-FEES-2.4",
      ruleTitle: "Institution Fee Breakdown Certification",
      expectedRequirement:
        "Official signed fee schedule indicating non-refundable tuition and institutional dues issued by authorized Finance / Accounts Officer.",
      actualEvidence: "Submitted document is an unofficial draft prospectus page.",
      policyVersion: "TCE-ST-2025-v1.1",
      gazetteClause: "Section 2, Clause 4, Top Class Scheme Norms",
      checkResult: "Requires Clarification",
    },
    automatedFinding: {
      summary: "Institutional fee structure document lacks official seal and signature",
      assistiveExplanation:
        "Document parsing indicated absence of official institute stamp or digital signature. Re-submission of verified invoice required before sanction.",
      severity: "warning",
    },
    auditTrail: [
      {
        timestamp: "22 Aug 2026, 08:20 AM",
        action: "Deficiency Notice Sent to Student",
        actor: "Officer P. K. Murmu (District Welfare Officer)",
      },
    ],
  },
  {
    id: "DCK-006",
    applicationId: "APP-2026-006",
    applicantName: "Arjun Baski",
    socialCategory: "Scheduled Tribe (ST)",
    schemeName: "Post-Matric Scholarship for ST Students (PMS-ST)",
    schemeCode: "MOTA-ST-PMS-2025",
    academicYear: "2025-2026",
    institutionName: "Birsa Institute of Technology, Sindri",
    courseName: "B.Tech Mechanical Engineering",
    currentStage: "Under Officer Review",
    submissionDate: "17 Aug 2026",
    priority: "Priority Review",
    evidence: {
      fieldOrDocument: "Rectified Income Certificate (Re-upload)",
      sourceDocument: "rectified_income_cert_signed_tehsildar_fy25.pdf",
      documentId: "DOC-503",
      extractedValue: "Issuance Date: 14-May-2025 (FY 2024-25); Annual Family Income: ₹1,95,000",
      declaredValue: "Annual Family Income: ₹1,95,000",
      registrySource: "DigiLocker Live Certificate Query",
      verificationStatus: "Verified",
    },
    policyCheck: {
      ruleCode: "RULE-MOTA-INC-4.2",
      ruleTitle: "Income Ceiling & Validity Period",
      expectedRequirement:
        "Valid certificate for FY 2024-25 with income under ₹2,50,000 p.a.",
      actualEvidence: "Valid certificate issued on 14-May-2025 for FY 2024-25; ₹1,95,000.",
      policyVersion: "PMS-ST-2025-v2.3",
      gazetteClause: "Clause 4.2.1, Post-Matric ST Guidelines",
      checkResult: "Compliant",
    },
    automatedFinding: {
      summary: "Rectified certificate successfully verified; ready for officer decision",
      assistiveExplanation:
        "Student resubmitted a valid certificate following the deficiency notice. Registry check confirmed authenticity. Ready for statutory officer review.",
      severity: "info",
    },
    auditTrail: [
      {
        timestamp: "22 Aug 2026, 01:10 PM",
        action: "Docket Placed in Officer Review Queue",
        actor: "Workflow Controller",
      },
      {
        timestamp: "22 Aug 2026, 12:45 PM",
        action: "Student Uploaded Rectified Certificate",
        actor: "Student Arjun Baski",
      },
    ],
  },
];
