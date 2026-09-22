export type OfficialApplicationStatus =
  | "Submitted"
  | "Under Document Verification"
  | "Deficiency Raised"
  | "Resubmission Required"
  | "Under Institute Verification"
  | "Under Officer Review"
  | "Decision Recorded"
  | "Payment Processing"
  | "Completed";

export type OfficialDocumentStatus =
  | "Verified"
  | "Deficiency"
  | "Pending Verification"
  | "Under Review"
  | "Rejected";

export interface DocumentRegisterItem {
  id: string;
  documentName: string;
  documentId: string;
  uploadedOn: string;
  verificationStatus: OfficialDocumentStatus;
  finding: string;
  sourceAuthority: string;
  fileSize: string;
  canReplace?: boolean;
}

export interface LifecycleStep {
  stepNumber: number;
  label: string;
  status: "completed" | "current" | "upcoming" | "deficiency";
  timestamp?: string;
  note?: string;
}

export interface StudentApplicationData {
  applicationId: string;
  applicantName: string;
  socialCategory: string;
  schemeName: string;
  schemeCode: string;
  academicYear: string;
  institutionName: string;
  courseName: string;
  submissionDate: string;
  currentStatus: OfficialApplicationStatus;
  sanctionAmount: string;
  lifecycleSteps: LifecycleStep[];
  activeDeficiency?: {
    documentId: string;
    documentName: string;
    findingDescription: string;
    requiredRectification: string;
    noticeDate: string;
    deadlineDate: string;
  };
  documentRegister: DocumentRegisterItem[];
  eventLog: {
    id: string;
    timestamp: string;
    sender: string;
    subject: string;
    details: string;
    severity: "info" | "warning" | "success";
  }[];
}

export interface VerificationEvidence {
  fieldOrDocument: string;
  sourceDocument: string;
  documentId: string;
  extractedValue: string;
  declaredValue: string;
  registrySource: string;
  verificationStatus: OfficialDocumentStatus;
}

export interface PolicyCheck {
  ruleCode: string;
  ruleTitle: string;
  expectedRequirement: string;
  actualEvidence: string;
  policyVersion: string;
  gazetteClause: string;
  checkResult: "Compliant" | "Discrepancy Detected" | "Requires Clarification";
}

export interface OfficerVerificationDocket {
  id: string;
  applicationId: string;
  applicantName: string;
  socialCategory: string;
  schemeName: string;
  schemeCode: string;
  academicYear: string;
  institutionName: string;
  courseName: string;
  currentStage: OfficialApplicationStatus;
  submissionDate: string;
  priority: "Normal" | "Priority Review" | "Escalated";
  evidence: VerificationEvidence;
  policyCheck: PolicyCheck;
  automatedFinding: {
    summary: string;
    assistiveExplanation: string;
    severity: "warning" | "info" | "critical";
  };
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export interface PortalNotice {
  id: string;
  date: string;
  category: "General" | "Urgent" | "Guidelines" | "Scheme Update";
  title: string;
  linkText?: string;
  isNew?: boolean;
}
