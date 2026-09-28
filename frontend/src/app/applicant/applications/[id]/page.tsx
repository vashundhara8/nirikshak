"use client";

import { useEffect, useState, useCallback, use } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useDropzone } from "react-dropzone";

// Supported document types matching backend document model / policy engine expectations
const SUPPORTED_DOC_TYPES = [
  { value: "ST_CERTIFICATE", label: "ST/Caste Certificate" },
  { value: "INCOME_CERTIFICATE", label: "Income Certificate" },
  { value: "DOMICILE_CERTIFICATE", label: "Domicile Certificate" },
  { value: "AADHAR", label: "Aadhaar Card" },
  { value: "MARKSHEET", label: "Mark Sheet / Result" },
  { value: "PASSPORT_PHOTO", label: "Passport Photo" },
];

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const applicationId = unwrappedParams.id;

  const [application, setApplication] = useState<any>(null);
  const [deficiencies, setDeficiencies] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(SUPPORTED_DOC_TYPES[0].value);

  const loadData = async () => {
    try {
      const appData = await fetchApi<any>(`/applications/${applicationId}`);
      setApplication(appData);
      try {
        const defData = await fetchApi<any>(`/applications/${applicationId}/deficiencies`);
        setDeficiencies(Array.isArray(defData) ? defData : []);
      } catch {}
      try {
        const verData = await fetchApi<any>(`/applications/${applicationId}/verification`);
        setVerification(verData);
      } catch {}
    } catch (err: any) {
      setError(err.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [applicationId]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], deficiencyId?: string) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        const file = acceptedFiles[0];
        const token = localStorage.getItem("nirikshak_token");
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (deficiencyId) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("deficiency_id", deficiencyId);
          const res = await fetch(`${apiBase}/applications/${applicationId}/resubmit`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Resubmit failed");
        } else {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("document_type", selectedDocType);
          const res = await fetch(`${apiBase}/applications/${applicationId}/documents`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Upload failed");
        }
        await loadData();
      } catch (err: any) {
        alert("Failed to upload: " + err.message);
      } finally {
        setUploading(false);
      }
    },
    [applicationId, selectedDocType]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, deficiencies.find(d => d.status === "OPEN")?.deficiency_id)
  });

  const triggerVerification = async () => {
    setVerifying(true);
    try {
      await fetchApi(`/applications/${applicationId}/verification-runs`, { method: "POST" });
      for (let i = 0; i < 6; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const verData = await fetchApi<any>(`/applications/${applicationId}/verification`).catch(() => null);
        if (verData && verData.status !== "PROCESSING") break;
      }
      await loadData();
    } catch (err: any) {
      alert("Verification trigger failed: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await fetchApi(`/applications/${applicationId}/submit`, { method: "POST" });
      await loadData();
    } catch (err: any) {
      alert("Submit failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!application) return <div className="p-8">Not found</div>;

  const openDeficiencies = deficiencies.filter((d) => d.status === "OPEN");
  
  const isOutdated = verification?.is_outdated;
  const isPassed = verification?.status === "COMPLETED" && verification?.result_summary?.operational_status === "NO_DEFICIENCY";
  const hasBlocking = verification?.result_summary?.blocking_count > 0;
  
  let submitDisabledReason = "";
  if (!verification || verification.status === "NOT_STARTED") submitDisabledReason = "Verification has not been run yet.";
  else if (verification.status === "PROCESSING") submitDisabledReason = "Verification is currently running.";
  else if (isOutdated) submitDisabledReason = "Verification is outdated. Please run verification again.";
  else if (hasBlocking) submitDisabledReason = `${verification.result_summary.blocking_count} blocking verification issue(s) must be resolved.`;
  else if (verification.status === "FAILED") submitDisabledReason = "Verification failed due to a technical error.";
  
  const canSubmit = application.status === "DRAFT" && !submitDisabledReason;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center">
        <Link href="/applicant/dashboard" className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        {["DRAFT", "REQUIRES_CORRECTION"].includes(application.status) && (
          <Link href={`/applicant/apply?edit=${applicationId}`} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-sm font-medium transition-colors">
            Edit Application Details
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{application.scheme_code}</h1>
          <p className="text-slate-500 mt-1">Academic Year: {application.academic_year}</p>
        </div>
        <div className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-semibold border border-slate-200">
          {application.status}
        </div>
      </div>

      {/* Main Verification Status Banner */}
      {verification && verification.status !== "NOT_STARTED" && (
        <div className={`p-4 rounded-lg border flex items-start space-x-3 ${
          isOutdated ? "bg-amber-50 border-amber-200" :
          hasBlocking ? "bg-red-50 border-red-200" :
          isPassed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
        }`}>
          {isOutdated ? <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" /> :
           hasBlocking ? <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" /> :
           isPassed ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" /> : 
           <Info className="w-6 h-6 text-slate-600 flex-shrink-0" />}
          
          <div className="flex-1">
            <h3 className={`font-bold ${isOutdated ? "text-amber-800" : hasBlocking ? "text-red-800" : isPassed ? "text-green-800" : "text-slate-800"}`}>
              {isOutdated ? "⚠ Verification needs to be re-run" :
               hasBlocking ? "🔴 Action required before submission" :
               isPassed ? (verification.result_summary?.high_count > 0 ? "✓ Verification passed with warnings" : "✓ Verification passed") :
               "Verification Status: " + verification.status}
            </h3>
            <p className={`text-sm mt-1 ${isOutdated ? "text-amber-700" : hasBlocking ? "text-red-700" : isPassed ? "text-green-700" : "text-slate-700"}`}>
              {isOutdated ? "Your documents or application details changed after the last verification." :
               hasBlocking ? "There are blocking issues that prevent this application from being submitted." :
               isPassed ? "Your application meets all requirements and can be submitted." :
               verification.error_state || "Verification is in progress."}
            </p>
            {isOutdated && (
              <button onClick={triggerVerification} disabled={verifying} className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 disabled:opacity-50">
                {verifying ? "Verifying..." : "Run Verification Again"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Structured Deficiencies UI */}
      {openDeficiencies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-800 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2" /> Blocking Issues
          </h2>
          {openDeficiencies.map((def, idx) => {
            const d = def.details || {};
            const isFieldMismatch = def.type === "FIELD_MISMATCH" || d.validation_type === "NAME_CONSISTENCY";
            
            return (
              <Card key={idx} className="border-red-200 shadow-sm overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center">
                  <h3 className="text-red-800 font-bold flex items-center">
                    🔴 {d.field ? `${d.field} mismatch` : def.type.replace(/_/g, ' ')}
                  </h3>
                  <Badge variant="error">BLOCKING</Badge>
                </div>
                <CardContent className="p-5 bg-white space-y-4">
                  {isFieldMismatch && d.values && d.values.length >= 2 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {d.values.map((v: any, vidx: number) => (
                        <div key={vidx} className="p-3 bg-slate-50 border rounded-md">
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                            {v.document_type === "APPLICATION" ? "Application" : v.document_type}
                          </p>
                          <p className="font-medium text-slate-900">{v.raw_value || "(Empty)"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700">{d.reason || "An issue was found with your documents."}</p>
                  )}
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                    <h4 className="font-semibold text-blue-900 text-sm mb-1 flex items-center"><Info size={14} className="mr-1"/> Why this matters</h4>
                    <p className="text-blue-800 text-sm">
                      {isFieldMismatch ? `The ${d.field || 'information'} entered in your application does not match the value found in your uploaded documents.` : "This issue prevents us from validating your eligibility."}
                    </p>
                    
                    <h4 className="font-semibold text-blue-900 text-sm mb-1 mt-4">What you can do</h4>
                    <ul className="text-blue-800 text-sm list-disc pl-5 space-y-1">
                      {isFieldMismatch && <li>If the document is correct, <strong>Edit Application Details</strong> to match it.</li>}
                      <li>If the document is incorrect or outdated, <strong>Replace the Document</strong> below.</li>
                      <li>After making changes, run verification again.</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link href={`/applicant/apply?edit=${applicationId}`} className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-sm font-medium transition-colors">
                      Edit Application
                    </Link>
                    <div className="relative">
                      <input type="file" onChange={(e) => e.target.files && onDrop(Array.from(e.target.files), def.deficiency_id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf,image/jpeg,image/png"/>
                      <button className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded text-sm font-medium transition-colors flex items-center pointer-events-none">
                        <Upload size={14} className="mr-2" /> Replace Document
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* NIRIKSHAK Verification Assistant */}
      {verification && verification.status === "COMPLETED" && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
          <CardContent className="p-5 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">N</div>
            <div>
              <h3 className="font-bold text-blue-900">NIRIKSHAK Verification Assistant</h3>
              <p className="text-sm text-blue-800 mt-1">
                {hasBlocking 
                  ? "Your application currently has blocking issues. Please check the expected values above. If your uploaded document contains the correct information, use the 'Edit Application Details' button to fix your application form. Otherwise, upload a newer document."
                  : isPassed 
                    ? "Congratulations! Your application has passed pre-submission checks. You may submit it now."
                    : "Please review the warnings below. You can submit your application, but an officer will manually review the warnings."}
              </p>
              {hasBlocking && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs rounded-full cursor-pointer hover:bg-blue-50">How do I fix it?</span>
                  <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs rounded-full cursor-pointer hover:bg-blue-50">Why is this blocking?</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-400" />
            Documents
          </h2>

          {application.documents?.length > 0 ? (
            <ul className="space-y-3 mb-6">
              {application.documents.map((doc: any) => (
                <li key={doc.document_id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.document_type}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      v{doc.versions?.[doc.versions.length - 1]?.version_number || 1} &bull;{" "}
                      {doc.versions?.[doc.versions.length - 1]?.status || "UPLOADED"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 mb-4">No documents uploaded yet.</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Additional Document</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-teal-700 outline-none bg-white mb-3"
            >
              {SUPPORTED_DOC_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
            <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer transition-colors block relative">
              <input type="file" onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf,image/jpeg,image/png"/>
              <Upload className="mx-auto h-6 w-6 text-slate-400 mb-2" />
              {uploading ? <p className="text-xs text-teal-600">Uploading...</p> : <p className="text-sm text-slate-600">Click to upload {selectedDocType.replace('_',' ')}</p>}
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-slate-400" />
              Submission Action
            </h2>
            
            {application.status === "DRAFT" ? (
              <div className="space-y-3">
                <button
                  onClick={submitApplication}
                  disabled={!canSubmit || submitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg font-medium transition-colors"
                >
                  <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                </button>
                {!canSubmit && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                    <strong>Disabled:</strong> {submitDisabledReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border">
                Application has been submitted and is currently: <strong>{application.status}</strong>.
              </p>
            )}
          </div>
          
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Verification Controls</h3>
            <button
              onClick={triggerVerification}
              disabled={verifying}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-teal-700 text-teal-700 hover:bg-teal-50 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={verifying ? "animate-spin" : ""} />
              <span>{verifying ? "Verifying..." : "Run Verification"}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Grouped Verification Breakdown */}
      {verification && verification.findings && verification.findings.length > 0 && (
        <Card className="shadow-sm border-base-border mt-6">
          <CardHeader className="bg-slate-50 border-b border-base-border py-4">
            <CardTitle className="text-base flex items-center text-navy"><CheckCircle size={18} className="mr-2 text-teal-primary"/> Detailed Verification Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg border text-center">
                <p className="text-2xl font-bold text-slate-800">{verification.finding_count || 0}</p>
                <p className="text-xs text-slate-500 uppercase">Rules Evaluated</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                <p className="text-2xl font-bold text-red-700">{verification.result_summary?.blocking_count || 0}</p>
                <p className="text-xs text-red-600 uppercase">Blocking Issues</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center">
                <p className="text-2xl font-bold text-amber-700">{(verification.result_summary?.high_count || 0) + (verification.result_summary?.medium_count || 0)}</p>
                <p className="text-xs text-amber-600 uppercase">Warnings</p>
              </div>
            </div>
          
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {verification.findings.map((f: any, idx: number) => {
                const isPass = f.status === "PASS";
                const isFail = f.status === "FAIL" || f.status === "MANUAL_REVIEW_REQUIRED";
                return (
                  <div key={idx} className={`p-3 border rounded text-sm ${isFail ? 'bg-red-50 border-red-100' : isPass ? 'bg-green-50 border-green-100' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>{f.source_identifier}</strong>
                        <p className="text-slate-600 mt-1">{f.details?.reason || (isPass ? "Validation successful" : "Issue detected")}</p>
                      </div>
                      <Badge variant={isPass ? 'success' : isFail ? 'error' : 'warning'}>{f.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
