"use client";

import { useEffect, useState, useCallback, use } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useDropzone } from "react-dropzone";

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

  const loadData = async () => {
    try {
      const appData = await fetchApi<any>(`/applications/${applicationId}`);
      setApplication(appData);

      try {
        const defData = await fetchApi<any>(`/applications/${applicationId}/deficiencies`);
        setDeficiencies(Array.isArray(defData) ? defData : []);
      } catch (e) {
        // Ignored
      }

      try {
        const verData = await fetchApi<any>(`/applications/${applicationId}/verification`);
        setVerification(verData);
      } catch (e) {
        // Ignored
      }
    } catch (err: any) {
      setError(err.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    
    // Check if we are resolving a deficiency
    const openDeficiency = deficiencies.find(d => d.status === "OPEN");
    
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", "INCOME_CERTIFICATE"); // Simple default for demo
      formData.append("metadata", "{}");

      if (openDeficiency) {
        await fetchApi(`/applications/${applicationId}/resubmit`, {
          method: "POST",
          body: JSON.stringify({
            deficiency_id: openDeficiency.deficiency_id,
            document_type: "INCOME_CERTIFICATE",
            file_name: file.name
            // In real app, we would send base64 or use multipart correctly. 
            // Our backend expects base64 or we adjust to use FormData in fetchApi
          })
        });
      } else {
        // Since fetchApi intercepts to JSON, we need to bypass for FormData or just use native fetch
        const token = localStorage.getItem("nirikshak_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applications/${applicationId}/documents`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
      }
      
      await loadData();
    } catch (err: any) {
      alert("Failed to upload: " + err.message);
    } finally {
      setUploading(false);
    }
  }, [applicationId, deficiencies]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const triggerVerification = async () => {
    setVerifying(true);
    try {
      await fetchApi(`/applications/${applicationId}/verification-runs`, { method: "POST" });
      await new Promise(r => setTimeout(r, 2000)); // wait for task
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/applicant/dashboard" className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
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

      {deficiencies.filter(d => d.status === "OPEN").map(def => (
        <div key={def.deficiency_id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="text-amber-800 font-bold">Action Required: Document Deficiency</h3>
              <p className="text-amber-700 text-sm mt-1">
                Issue with {def.type}. Please upload a corrected version below.
              </p>
            </div>
          </div>
        </div>
      ))}

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
                    <p className="text-xs text-slate-500">
                      v{doc.versions?.[doc.versions.length - 1]?.version_number || 1} • {doc.versions?.[doc.versions.length - 1]?.status || 'UPLOADED'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 mb-6">No documents uploaded yet.</p>
          )}

          <div {...getRootProps()} className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            {isDragActive ? (
              <p className="text-sm text-teal-700 font-medium">Drop the files here ...</p>
            ) : (
              <p className="text-sm text-slate-600">Drag & drop files here, or click to select files</p>
            )}
            {uploading && <p className="text-xs text-teal-600 mt-2">Uploading...</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-slate-400" />
            Verification Status
          </h2>
          
          {verification ? (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-600">Run Status</span>
                <span className="text-sm font-semibold text-slate-900">{verification.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-600">Total Findings</span>
                <span className="text-sm font-semibold text-slate-900">{verification.finding_count || 0}</span>
              </div>
              
              <button 
                onClick={triggerVerification}
                disabled={verifying || !['SUBMITTED', 'REQUIRES_CORRECTION'].includes(application.status)}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-4 border border-teal-700 text-teal-700 hover:bg-teal-50 rounded transition-colors"
              >
                <RefreshCw size={16} className={verifying ? "animate-spin" : ""} />
                <span>{verifying ? "Verifying..." : "Run Verification"}</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-4">No verification has been run yet.</p>
              
              {application.status === 'DRAFT' ? (
                <button 
                  onClick={submitApplication}
                  disabled={submitting || !application.documents?.length}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded transition-colors"
                >
                  <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                </button>
              ) : (
                <button 
                  onClick={triggerVerification}
                  disabled={verifying || !application.documents?.length || !['SUBMITTED', 'REQUIRES_CORRECTION'].includes(application.status)}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 rounded transition-colors"
                >
                  <RefreshCw size={16} className={verifying ? "animate-spin" : ""} />
                  <span>{verifying ? "Start Verification" : "Start Verification"}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
