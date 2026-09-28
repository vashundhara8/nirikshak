"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { FileText, CheckCircle, UploadCloud, AlertTriangle, Download, RefreshCw } from "lucide-react";

type VaultDocument = {
  document_id: string;
  version_id: string;
  type: string;
  file_size: number;
  created_at: string;
  status: string;
  is_digilocker: boolean;
};

export default function MyDocuments() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadVault();
  }, []);

  async function loadVault() {
    setLoading(true);
    try {
      const data = await fetchApi<{ documents: VaultDocument[] }>("/documents/vault");
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSync = async () => {
    setSyncing(true);
    // Simulate DigiLocker sync delay
    setTimeout(() => {
      setSyncing(false);
      loadVault();
    }, 1500);
  };

  const handleDownload = async (versionId: string) => {
    try {
      const res = await fetchApi<{ signed_url: string }>(`/documents/${versionId}/download`);
      if (res.signed_url) {
        window.open(res.signed_url, "_blank");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to download document");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-teal-primary h-full"></div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-2">My Document Vault</h1>
        <p className="text-slate-500 text-sm max-w-xl">
          Manage your verified certificates. Documents stored in your vault can be automatically reused across all scholarship applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DigiLocker Sync Card */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between shadow-lg gap-4">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                 <UploadCloud className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg">DigiLocker Sync Enabled</h3>
                <p className="text-blue-200 text-sm">Your account is connected to DigiLocker. Verified documents are synced automatically.</p>
              </div>
           </div>
           <button 
             onClick={handleSync}
             disabled={syncing}
             className="bg-white text-blue-900 font-bold px-5 py-2.5 rounded-lg text-sm shadow-md hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-75"
           >
              {syncing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {syncing ? "Syncing..." : "Resync Now"}
           </button>
        </div>

        {loading ? (
          <div className="col-span-1 md:col-span-3 text-center py-12 text-slate-400 font-medium">Loading Document Vault...</div>
        ) : documents.length === 0 ? (
          <div className="col-span-1 md:col-span-3 bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-xl font-bold text-navy mb-2">No Documents Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">You haven't uploaded any documents yet. They will appear here once you apply for a scheme or sync from DigiLocker.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div key={doc.document_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="w-12 h-12 bg-teal-50 text-teal-primary rounded-xl flex items-center justify-center mb-4 border border-teal-100 group-hover:bg-teal-primary group-hover:text-white transition-colors">
                 <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy mb-1">{doc.type.replace(/_/g, " ")}</h3>
              <p className="text-xs text-slate-500 mb-4 flex-1">
                Uploaded on {format(new Date(doc.created_at), "dd MMM yyyy")}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-1 rounded">VERIFIED</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded">
                    {(doc.file_size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button onClick={() => handleDownload(doc.version_id)} className="text-slate-400 hover:text-teal-primary transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
