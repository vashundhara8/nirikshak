import * as React from "react";
import { DocumentRegisterItem } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, UploadCloud } from "lucide-react";

interface DocumentRegisterProps {
  documents: DocumentRegisterItem[];
}

export function DocumentRegister({ documents }: DocumentRegisterProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs overflow-hidden" id="documents">
      <div className="bg-[#0A192F] text-white px-4 py-2.5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Official Statutory Document Register
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Cross-verification against DigiLocker, JharSewa, and State Revenue Authority Registries
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded-[2px] border border-slate-700">
          Total Documents: {documents.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 border-r border-slate-200">Document</th>
              <th className="py-2.5 px-3 border-r border-slate-200 w-24">Document ID</th>
              <th className="py-2.5 px-3 border-r border-slate-200 w-28">Uploaded On</th>
              <th className="py-2.5 px-3 border-r border-slate-200 w-36">Verification Status</th>
              <th className="py-2.5 px-3 border-r border-slate-200">Finding / Registry Observation</th>
              <th className="py-2.5 px-3 text-right w-36">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {documents.map((doc, idx) => (
              <tr
                key={doc.id}
                className={idx % 2 === 0 ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/50 hover:bg-slate-50"}
              >
                <td className="py-2.5 px-3 border-r border-slate-200">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">
                        {doc.documentName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {doc.fileSize} • Issuer: {doc.sourceAuthority}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                  {doc.documentId}
                </td>

                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                  {doc.uploadedOn}
                </td>

                <td className="py-2.5 px-3 border-r border-slate-200">
                  <StatusBadge status={doc.verificationStatus} size="sm" />
                </td>

                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 leading-snug">
                  {doc.finding}
                </td>

                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] border-slate-300">
                      <Download className="w-3 h-3 mr-1 text-slate-500" />
                      View
                    </Button>
                    {doc.canReplace && (
                      <Button variant="default" size="sm" className="h-7 px-2 text-[11px] bg-amber-700 hover:bg-amber-800 text-white font-semibold">
                        <UploadCloud className="w-3 h-3 mr-1 text-amber-200" />
                        Replace
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
