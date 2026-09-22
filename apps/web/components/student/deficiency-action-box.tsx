import * as React from "react";
import { AlertTriangle, UploadCloud, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeficiencyActionBoxProps {
  deficiency?: {
    documentId: string;
    documentName: string;
    findingDescription: string;
    requiredRectification: string;
    noticeDate: string;
    deadlineDate: string;
  };
}

export function DeficiencyActionBox({ deficiency }: DeficiencyActionBoxProps) {
  if (!deficiency) return null;

  return (
    <div
      id="deficiencies"
      className="border border-amber-400 bg-amber-50/60 rounded-[2px] p-4 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 pb-3 border-b border-amber-300">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-[2px] bg-amber-200 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-800" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-1.5 py-0.2 rounded-[2px]">
              Deficiency Notice Active
            </span>
            <h2 className="text-sm font-bold text-amber-950 mt-0.5">
              Action Required: {deficiency.documentName} ({deficiency.documentId})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-950 bg-white px-2.5 py-1 border border-amber-300 rounded-[2px]">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>Rectification Deadline: {deficiency.deadlineDate}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-white border border-amber-200 rounded-[2px]">
          <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-700" />
            <span>Verification Observation</span>
          </div>
          <p className="text-slate-800 mt-1 leading-snug">
            {deficiency.findingDescription}
          </p>
          <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
            Notice Issued: {deficiency.noticeDate} by District Welfare Desk
          </div>
        </div>

        <div className="p-3 bg-white border border-amber-200 rounded-[2px] flex flex-col justify-between">
          <div>
            <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              Required Applicant Action
            </div>
            <p className="text-slate-800 mt-1 leading-snug">
              {deficiency.requiredRectification}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
            <Button variant="default" size="sm" className="bg-[#0A192F] hover:bg-[#1E3A5F] gap-1.5 text-xs font-semibold">
              <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
              Upload Rectified Document (FY 2024-25)
            </Button>
            <span className="text-[10px] text-slate-500">
              Supported formats: PDF / JPEG up to 2MB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
