import * as React from "react";
import { OfficerVerificationDocket } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";
import { Building, Calendar, User, Clock } from "lucide-react";

interface OfficerAppHeaderProps {
  docket: OfficerVerificationDocket;
}

export function OfficerAppHeader({ docket }: OfficerAppHeaderProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs">
      <div className="bg-[#0A192F] text-white px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-amber-300 bg-slate-800 px-2 py-0.5 border border-slate-700 rounded-[2px]">
            {docket.applicationId}
          </span>
          <span className="font-bold text-white text-xs">
            {docket.applicantName}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-300">
            {docket.socialCategory}
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-300 font-mono">
            Priority: {docket.priority}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={docket.currentStage} size="sm" />
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50/50">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            <span>Scheme & Code</span>
          </div>
          <div className="font-bold text-slate-900 mt-0.5 truncate" title={docket.schemeName}>
            {docket.schemeName}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {docket.schemeCode}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span>Institution & Course</span>
          </div>
          <div className="font-bold text-slate-900 mt-0.5 truncate" title={docket.institutionName}>
            {docket.institutionName}
          </div>
          <div className="text-[10px] text-slate-600 truncate">
            {docket.courseName}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Academic Session</span>
          </div>
          <div className="font-bold text-slate-900 mt-0.5">
            {docket.academicYear}
          </div>
          <div className="text-[10px] text-slate-500">
            Submission: {docket.submissionDate}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Governance Jurisdiction</span>
          </div>
          <div className="font-bold text-slate-900 mt-0.5">
            Ranchi District Welfare Office
          </div>
          <div className="text-[10px] text-teal-800 font-medium">
            Authorized Officer Sign-off Desk
          </div>
        </div>
      </div>
    </div>
  );
}
