"use client";

import { useEffect, useState, use } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Check, FileQuestion, Search, Shield } from "lucide-react";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchApi<any>(`/officer/applications/${applicationId}`);
        setApp(data);
      } catch (err: any) {
        setError(err.message || "Failed to load application details");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [applicationId]);

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionAction) return alert("Select an action");
    
    setSubmitting(true);
    try {
      await fetchApi(`/officer/applications/${applicationId}/decision`, {
        method: "POST",
        body: JSON.stringify({
          action: decisionAction,
          reason: decisionNotes,
          deficiency_type: decisionAction === "REQUEST_CORRECTION" ? deficiencyType : undefined
        })
      });
      alert("Decision recorded successfully");
      router.push("/officer/dashboard");
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Workspace...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!app) return null;

  const latestRun = app.verification_runs?.[0]; // Assuming sorted desc
  const findings = latestRun?.findings || [];
  const openDeficiencies = app.deficiencies?.filter((d: any) => d.status === "OPEN") || [];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-none">
        <Link href="/officer/dashboard" className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium mb-4">
          <ArrowLeft size={16} />
          <span>Back to Queue</span>
        </Link>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Application: {app.application_id.substring(0,8)}...</h1>
            <p className="text-sm text-slate-500">{app.scheme_code} • {app.academic_year}</p>
          </div>
          
          <div className="flex-1 text-center hidden md:block">
            <span className="inline-flex items-center space-x-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider">
              <span className="text-teal-400">AI ASSISTS</span>
              <span className="text-slate-400">→</span>
              <span className="text-gold-400">RULES GOVERN</span>
              <span className="text-slate-400">→</span>
              <span className="text-white">OFFICER DECIDES</span>
            </span>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-bold border border-slate-200">
              {app.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* LEFT COLUMN: Metadata & Findings */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto">
          {/* Metadata */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-900">Applicant Declared Data</h2>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Name:</span><span className="font-medium">{app.applicant_profile?.applicant?.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">DOB:</span><span className="font-medium">{app.applicant_profile?.applicant?.dob || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-medium">{app.applicant_profile?.demographic?.category || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Income:</span><span className="font-medium">{app.applicant_profile?.demographic?.annual_family_income || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Institution:</span><span className="font-medium">{app.applicant_profile?.academic?.institution_name || 'N/A'}</span></div>
            </div>
          </div>

          {/* PANEL 2: Verification Findings */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-900 flex items-center"><CheckCircle className="mr-2" size={18}/> Policy Findings</h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {!latestRun && <p className="text-sm text-slate-500">No automated verification run exists.</p>}
            
            {openDeficiencies.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                <strong>Active Deficiencies:</strong>
                <ul className="list-disc pl-5 mt-1">
                  {openDeficiencies.map((d: any) => <li key={d.deficiency_id}>{d.type}</li>)}
                </ul>
              </div>
            )}

            {findings.map((finding: any) => (
              <div key={finding.finding_id} className={`p-3 border rounded text-sm ${finding.status === 'PASS' ? 'bg-green-50 border-green-200' : (finding.status === 'MANUAL_REVIEW' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200')}`}>
                <div className="flex items-center space-x-2 font-bold mb-1">
                  {finding.status === 'PASS' ? <Check size={16} className="text-green-600"/> : <AlertTriangle size={16} className={finding.status === 'MANUAL_REVIEW' ? 'text-amber-600' : 'text-red-600'}/>}
                  <span className={finding.status === 'PASS' ? 'text-green-800' : (finding.status === 'MANUAL_REVIEW' ? 'text-amber-800' : 'text-red-800')}>
                    {finding.source_identifier}
                  </span>
                </div>
                <p className="text-slate-700 mt-1">{typeof finding.details === 'object' ? JSON.stringify(finding.details) : finding.details}</p>
                {finding.evidence?.length > 0 && (
                  <div className="mt-2 text-xs border-t border-slate-200/50 pt-2 text-slate-600">
                    <strong>Evidence trace:</strong>
                    {finding.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="mt-1 font-mono">
                        {ev.field}: "{typeof ev.extracted_value === 'object' ? JSON.stringify(ev.extracted_value) : ev.extracted_value}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
        
        {/* RIGHT COLUMN: Document Viewer & Decision */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Document Viewer */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex space-x-4 overflow-x-auto">
              <span className="font-bold text-slate-900 flex items-center mr-4"><FileText className="mr-2" size={18}/> Documents</span>
              {app.documents?.map((doc: any) => (
                <a 
                  key={doc.document_id}
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'}/documents/${doc.versions?.[doc.versions.length - 1]?.version_id}/download`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  {doc.document_type} (v{doc.versions?.[doc.versions.length - 1]?.version_number || 1})
                </a>
              ))}
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 m-4 rounded">
              <p>Select a document above to view (Opens in new tab/viewer)</p>
            </div>
          </div>

        {/* PANEL 3: Officer Decision */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-sm flex flex-col overflow-hidden text-white">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <h2 className="font-bold flex items-center"><Shield className="mr-2 text-gold-400" size={18}/> Officer Decision</h2>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            <form onSubmit={handleDecision} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
                <select 
                  value={decisionAction}
                  onChange={e => setDecisionAction(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-teal-500 outline-none text-white text-sm"
                  required
                >
                  <option value="">Select Action...</option>
                  <option value="ACCEPT_VERIFICATION">Accept System Verification</option>
                  <option value="APPROVE">Final Approve</option>
                  <option value="REJECT">Reject Application</option>
                  <option value="REQUEST_CORRECTION">Request Correction (Deficiency)</option>
                </select>
              </div>

              {decisionAction === "REQUEST_CORRECTION" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Deficiency Type</label>
                  <select 
                    value={deficiencyType}
                    onChange={e => setDeficiencyType(e.target.value)}
                    className="w-full p-2 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-teal-500 outline-none text-white text-sm"
                    required
                  >
                    <option value="">Select Document...</option>
                    <option value="INCOME_CERTIFICATE">Income Certificate</option>
                    <option value="CASTE_CERTIFICATE">Caste Certificate</option>
                    <option value="DOMICILE_CERTIFICATE">Domicile Certificate</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Remarks / Reason (Required for Rejects & Corrections)</label>
                <textarea 
                  value={decisionNotes}
                  onChange={e => setDecisionNotes(e.target.value)}
                  rows={4}
                  className="w-full p-2 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-teal-500 outline-none text-white text-sm"
                  required={["REJECT", "REQUEST_CORRECTION"].includes(decisionAction)}
                />
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700">
                <button
                  type="submit"
                  disabled={submitting || !decisionAction}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded transition-colors disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Record Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
