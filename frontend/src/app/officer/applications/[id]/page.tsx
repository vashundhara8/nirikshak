/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import { fetchApi, getAuthToken } from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText,
  Check, Shield, ChevronDown, ChevronUp, User, BookOpen,
  Banknote, Home, GraduationCap, ClipboardList, AlertCircle,
  Eye, RotateCcw, ThumbsUp, ThumbsDown, MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function OfficerApplicationView({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const applicationId = unwrappedParams.id;
  const router = useRouter();

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [decisionAction, setDecisionAction] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [deficiencyType, setDeficiencyType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState(false);

  const [selectedDocVersionId, setSelectedDocVersionId] = useState<string | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>("");
  const [docBlobUrl, setDocBlobUrl] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docError, setDocError] = useState("");

  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "deficiencies" | "history">("findings");

  const loadDocument = async (versionId: string, docName: string) => {
    if (selectedDocVersionId === versionId) return;
    if (docBlobUrl) URL.revokeObjectURL(docBlobUrl);
    setDocBlobUrl(null);
    setSelectedDocVersionId(versionId);
    setSelectedDocName(docName);
    setLoadingDoc(true);
    setDocError("");
    try {
      const token = getAuthToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1"}/documents/${versionId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Document unavailable or access denied.");
      const blob = await res.blob();
      setDocBlobUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      setDocError(e.message || "Failed to load document");
    } finally {
      setLoadingDoc(false);
    }
  };

  useEffect(() => () => { if (docBlobUrl) URL.revokeObjectURL(docBlobUrl); }, [docBlobUrl]);

  useEffect(() => {
    fetchApi<any>(`/officer/applications/${applicationId}`)
      .then(setApp)
      .catch((err: any) => setError(err.message || "Failed to load application"))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionAction) return;
    setSubmitting(true);
    try {
      await fetchApi(`/officer/applications/${applicationId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          action: decisionAction,
          reason: decisionNotes,
          deficiency_type: decisionAction === "REQUEST_CORRECTION" ? deficiencyType : undefined,
        }),
      });
      setDecisionSuccess(true);
      setTimeout(() => router.push("/officer/dashboard"), 1800);
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin w-10 h-10 border-4 border-[#005F55] border-t-transparent rounded-full" />
        <p className="text-slate-500 font-medium text-sm">Loading Verification Workspace...</p>
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-red-500 text-center font-medium">{error}</div>;
  if (!app) return null;

  const latestRun = app.verification_runs?.[0];
  const findings = latestRun?.findings || [];
  const openDeficiencies = app.deficiencies?.filter((d: any) => d.status === "OPEN") || [];
  const passCount = findings.filter((f: any) => f.status === "PASS").length;
  const failCount = findings.filter((f: any) => f.status === "FAIL").length;
  const reviewCount = findings.filter((f: any) => f.status === "MANUAL_REVIEW").length;

  const profile = app.applicant_profile || {};
  const declared = profile.applicant || {};
  const demographic = profile.demographic || {};
  const academic = profile.academic || {};
  const bank = profile.bank || {};

  const statusColor = (s: string) => {
    if (s === "APPROVED") return "bg-green-50 text-green-700 border-green-200";
    if (s === "REJECTED") return "bg-red-50 text-red-700 border-red-200";
    if (s === "REQUIRES_MANUAL_REVIEW") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "DEFICIENCY_FOUND") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#F4F7FA]">

      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/officer/dashboard" className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold">
            <ArrowLeft size={15} className="mr-1.5" /> Back to Queue
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Application</span>
            <p className="font-bold text-[#12263F] text-sm leading-tight font-mono">{app.application_id?.substring(0, 13).toUpperCase()}...</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-[4px] border uppercase tracking-wide ${statusColor(app.status)}`}>
            {app.status?.replace(/_/g, " ")}
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-1 bg-[#12263F] rounded-full px-4 py-1.5">
          <span className="text-[#4ade80] text-[10px] font-extrabold tracking-widest uppercase">AI ASSISTS</span>
          <span className="text-slate-500 text-xs mx-1">→</span>
          <span className="text-amber-400 text-[10px] font-extrabold tracking-widest uppercase">RULES GOVERN</span>
          <span className="text-slate-500 text-xs mx-1">→</span>
          <span className="text-white text-[10px] font-extrabold tracking-widest uppercase">OFFICER DECIDES</span>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {app.scheme_code} &nbsp;•&nbsp; {app.academic_year}
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="flex flex-1 overflow-hidden">

        {/* ═══ COLUMN 1: Application Context ═══ */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col overflow-y-auto flex-shrink-0">

          {/* Application Summary */}
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Applicant Profile</h3>
            <div className="space-y-2.5">
              <ProfileRow icon={<User size={13} />} label="Name" value={declared.name || app.applicant_name || "—"} />
              <ProfileRow icon={<User size={13} />} label="DOB" value={declared.dob || "—"} />
              <ProfileRow icon={<Home size={13} />} label="Category" value={demographic.category || "—"} />
              <ProfileRow icon={<Banknote size={13} />} label="Family Income" value={demographic.annual_family_income ? `₹${Number(demographic.annual_family_income).toLocaleString("en-IN")}` : "—"} />
            </div>
          </div>

          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Academic</h3>
            <div className="space-y-2.5">
              <ProfileRow icon={<GraduationCap size={13} />} label="Institution" value={academic.institution_name || "—"} />
              <ProfileRow icon={<BookOpen size={13} />} label="Course" value={academic.course_name || "—"} />
              <ProfileRow icon={<BookOpen size={13} />} label="Year" value={academic.current_year ? `Year ${academic.current_year}` : "—"} />
            </div>
          </div>

          <div className="p-4 border-b border-slate-100">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Bank Details</h3>
            <div className="space-y-2.5">
              <ProfileRow icon={<Banknote size={13} />} label="Bank" value={bank.bank_name || "—"} />
              <ProfileRow icon={<Banknote size={13} />} label="Account" value={bank.account_number ? `****${bank.account_number.slice(-4)}` : "—"} />
              <ProfileRow icon={<Banknote size={13} />} label="IFSC" value={bank.ifsc_code || "—"} />
            </div>
          </div>

          {/* Documents List */}
          <div className="p-4 flex-1">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Documents ({app.documents?.length || 0})</h3>
            <div className="space-y-2">
              {app.documents?.map((doc: any) => {
                const latestVersion = doc.versions?.[doc.versions.length - 1];
                const isSelected = selectedDocVersionId === latestVersion?.version_id;
                return (
                  <button
                    key={doc.document_id}
                    onClick={() => latestVersion && loadDocument(latestVersion.version_id, doc.document_type)}
                    className={`w-full flex items-center text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                      isSelected
                        ? "bg-[#005F55] text-white border-[#005F55] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <FileText size={13} className={`mr-2.5 flex-shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{doc.document_type?.replace(/_/g, " ")}</p>
                      <p className={`text-[10px] ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                        v{latestVersion?.version_number || 1}
                        {doc.versions?.length > 1 ? ` (${doc.versions.length} versions)` : ""}
                      </p>
                    </div>
                    <Eye size={12} className={isSelected ? "text-white/70" : "text-slate-300"} />
                  </button>
                );
              })}
              {!app.documents?.length && (
                <p className="text-xs text-slate-400 text-center py-4">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* ═══ COLUMN 2: Document Viewer ═══ */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
              <FileText size={15} className="text-[#005F55] mr-2" />
              <span className="font-bold text-slate-800 text-sm">
                {selectedDocName ? selectedDocName.replace(/_/g, " ") : "Document Viewer"}
              </span>
            </div>
            {selectedDocName && (
              <span className="text-[10px] bg-[#005F55]/10 text-[#005F55] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Secure View
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-100 relative overflow-hidden">
            {loadingDoc ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                <div className="animate-spin w-8 h-8 border-4 border-[#005F55] border-t-transparent rounded-full mb-3" />
                <p className="text-slate-500 text-sm font-medium">Loading document securely...</p>
              </div>
            ) : docError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <AlertTriangle size={32} className="text-red-400 mb-3" />
                <p className="text-red-600 text-sm font-medium text-center">{docError}</p>
              </div>
            ) : docBlobUrl ? (
              <iframe
                src={`${docBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-none"
                title="Document Viewer"
                style={{ minHeight: "100%" }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 text-slate-300" />
                <p className="font-semibold text-sm">Select a document</p>
                <p className="text-xs mt-1 text-slate-400">Click a document from the left panel to view it</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ COLUMN 3: Evidence + Policy + Decision ═══ */}
        <div className="w-96 bg-white flex flex-col flex-shrink-0 overflow-hidden">

          {/* Policy Summary Bar */}
          {findings.length > 0 && (
            <div className="flex border-b border-slate-100 flex-shrink-0">
              <div className="flex-1 flex flex-col items-center py-2.5 border-r border-slate-100">
                <span className="text-lg font-black text-green-600">{passCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passed</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-2.5 border-r border-slate-100">
                <span className="text-lg font-black text-red-600">{failCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Failed</span>
              </div>
              <div className="flex-1 flex flex-col items-center py-2.5">
                <span className="text-lg font-black text-amber-500">{reviewCount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Review</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-200 flex-shrink-0">
            {[
              { key: "findings", label: "Policy Findings", count: findings.length },
              { key: "deficiencies", label: "Deficiencies", count: openDeficiencies.length },
              { key: "history", label: "History", count: null },
            ].map((tab: any) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors border-b-2 flex items-center justify-center space-x-1 ${
                  activeTab === tab.key
                    ? "border-[#005F55] text-[#005F55]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`rounded-full text-[9px] font-black w-4 h-4 flex items-center justify-center ${
                    activeTab === tab.key ? "bg-[#005F55] text-white" : "bg-slate-200 text-slate-600"
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "findings" && (
              <div className="p-3 space-y-2">
                {!latestRun && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <ClipboardList size={32} className="mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No verification run yet</p>
                    <p className="text-xs mt-1">Trigger verification to see AI findings</p>
                  </div>
                )}
                {findings.map((finding: any) => {
                  const isPass = finding.status === "PASS";
                  const isReview = finding.status === "MANUAL_REVIEW";
                  const isExpanded = expandedFinding === finding.finding_id;
                  return (
                    <div
                      key={finding.finding_id}
                      className={`rounded-lg border overflow-hidden ${
                        isPass ? "border-green-200 bg-green-50/50" :
                        isReview ? "border-amber-200 bg-amber-50/50" :
                        "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedFinding(isExpanded ? null : finding.finding_id)}
                        className="w-full flex items-center p-3 text-left"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mr-2.5 ${
                          isPass ? "bg-green-100" : isReview ? "bg-amber-100" : "bg-red-100"
                        }`}>
                          {isPass ? <Check size={11} className="text-green-600" strokeWidth={3} /> :
                           isReview ? <AlertCircle size={11} className="text-amber-600" strokeWidth={2.5} /> :
                           <XCircle size={11} className="text-red-600" strokeWidth={2.5} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${
                            isPass ? "text-green-800" : isReview ? "text-amber-800" : "text-red-800"
                          }`}>
                            {finding.source_identifier?.replace(/_/g, " ")}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isPass ? "✓ Rule passed" : isReview ? "⚠ Needs review" : "✗ Rule failed"}
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-200/60 px-3 pb-3 pt-2 space-y-2">
                          {/* REASON */}
                          <div>
                            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {typeof finding.details === "object"
                                ? (finding.details?.reason || finding.details?.message || "Processed by policy engine.")
                                : finding.details}
                            </p>
                          </div>

                          {/* EXTRACTED VALUES */}
                          {finding.details?.values?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Extracted Values</p>
                              <div className="bg-white rounded border border-slate-200 divide-y divide-slate-100">
                                {finding.details.values.map((v: any, i: number) => (
                                  <div key={i} className="flex justify-between px-2 py-1.5">
                                    <span className="text-[10px] text-slate-500">{v.document_type || v.document_id}</span>
                                    <span className="text-[10px] font-mono font-bold text-slate-800">{v.raw_value || v.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* EVIDENCE TRACE */}
                          {finding.evidence?.length > 0 && (
                            <div>
                              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Evidence Trace</p>
                              <div className="space-y-1">
                                {finding.evidence.map((ev: any, i: number) => (
                                  <div key={i} className="flex items-start bg-slate-50 rounded px-2 py-1.5 border border-slate-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#005F55] mt-1 mr-2 flex-shrink-0" />
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-600">{ev.field}</span>
                                      <span className="text-[10px] text-slate-400 mx-1">→</span>
                                      <span className="text-[10px] font-mono text-slate-800">
                                        {typeof ev.extracted_value === "object"
                                          ? JSON.stringify(ev.extracted_value)
                                          : ev.extracted_value}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "deficiencies" && (
              <div className="p-3 space-y-2">
                {openDeficiencies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <CheckCircle size={32} className="mb-3 text-green-400" />
                    <p className="text-sm font-medium text-green-600">No open deficiencies</p>
                  </div>
                ) : openDeficiencies.map((d: any) => (
                  <div key={d.deficiency_id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center mb-1.5">
                      <AlertTriangle size={13} className="text-red-500 mr-2" />
                      <span className="text-xs font-bold text-red-800">{d.type?.replace(/_/g, " ")}</span>
                    </div>
                    <p className="text-[11px] text-red-700 ml-5">{d.description || "Correction required."}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div className="p-3 space-y-2">
                {app.status_history?.length > 0 ? app.status_history.map((h: any, i: number) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-700">{h.status?.replace(/_/g, " ")}</span>
                      <span className="text-slate-400 text-[10px] ml-2">
                        {h.changed_at ? new Date(h.changed_at).toLocaleString("en-IN") : ""}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-6">No history available</p>
                )}
              </div>
            )}
          </div>

          {/* ═══ OFFICER DECISION PANEL ═══ */}
          <div className="border-t border-slate-200 bg-[#12263F] flex-shrink-0">
            <div className="px-4 py-3 border-b border-slate-700">
              <div className="flex items-center">
                <Shield size={14} className="text-[#4ade80] mr-2" />
                <span className="text-xs font-extrabold text-white uppercase tracking-widest">Officer Decision</span>
              </div>
            </div>

            {decisionSuccess ? (
              <div className="p-6 flex flex-col items-center">
                <CheckCircle size={32} className="text-[#4ade80] mb-2" />
                <p className="text-white font-bold text-sm">Decision Recorded</p>
                <p className="text-slate-400 text-xs mt-1">Redirecting to queue...</p>
              </div>
            ) : (
              <form onSubmit={handleDecision} className="p-4 space-y-3">
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setDecisionAction("APPROVE")}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      decisionAction === "APPROVE"
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-green-500 hover:text-green-400"
                    }`}>
                    <ThumbsUp size={12} className="mr-1.5" /> Approve
                  </button>
                  <button type="button" onClick={() => setDecisionAction("REJECT")}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      decisionAction === "REJECT"
                        ? "bg-red-500 border-red-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-red-500 hover:text-red-400"
                    }`}>
                    <ThumbsDown size={12} className="mr-1.5" /> Reject
                  </button>
                  <button type="button" onClick={() => setDecisionAction("REQUEST_CORRECTION")}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      decisionAction === "REQUEST_CORRECTION"
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-amber-500 hover:text-amber-400"
                    }`}>
                    <MessageSquare size={12} className="mr-1.5" /> Request Fix
                  </button>
                  <button type="button" onClick={() => setDecisionAction("ACCEPT_VERIFICATION")}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      decisionAction === "ACCEPT_VERIFICATION"
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400"
                    }`}>
                    <RotateCcw size={12} className="mr-1.5" /> Accept AI
                  </button>
                </div>

                {/* Deficiency Type (conditional) */}
                {decisionAction === "REQUEST_CORRECTION" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deficiency Document</label>
                    <select
                      value={deficiencyType}
                      onChange={(e) => setDeficiencyType(e.target.value)}
                      required
                      className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs outline-none focus:border-amber-500"
                    >
                      <option value="">Select document type...</option>
                      <option value="INCOME_CERTIFICATE">Income Certificate</option>
                      <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                      <option value="DOMICILE_CERTIFICATE">Domicile Certificate</option>
                      <option value="MARKSHEET">Marksheet</option>
                      <option value="BANK_PASSBOOK">Bank Passbook</option>
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="PHOTO">Photograph</option>
                    </select>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Remarks {["REJECT", "REQUEST_CORRECTION"].includes(decisionAction) && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter your reasoning or remarks..."
                    required={["REJECT", "REQUEST_CORRECTION"].includes(decisionAction)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs outline-none focus:border-[#4ade80] placeholder-slate-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !decisionAction}
                  className={`w-full py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center ${
                    decisionAction === "APPROVE" ? "bg-green-500 hover:bg-green-400 text-white" :
                    decisionAction === "REJECT" ? "bg-red-500 hover:bg-red-400 text-white" :
                    decisionAction === "REQUEST_CORRECTION" ? "bg-amber-500 hover:bg-amber-400 text-white" :
                    decisionAction === "ACCEPT_VERIFICATION" ? "bg-blue-500 hover:bg-blue-400 text-white" :
                    "bg-slate-700 text-slate-400 cursor-not-allowed"
                  } disabled:opacity-50`}
                >
                  {submitting ? (
                    <><div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full mr-2" /> Recording...</>
                  ) : !decisionAction ? "Select an action above" : `Confirm: ${decisionAction.replace(/_/g, " ")}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center text-slate-400 text-xs mr-2 flex-shrink-0">
        {icon}
        <span className="ml-1.5">{label}</span>
      </div>
      <span className="text-xs font-semibold text-slate-800 text-right max-w-[140px] truncate" title={value}>{value}</span>
    </div>
  );
}
