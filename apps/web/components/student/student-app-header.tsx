import * as React from "react";
import { StudentApplicationData } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";
import { Building, BookOpen, Calendar, IndianRupee } from "lucide-react";

interface StudentAppHeaderProps {
  application: StudentApplicationData;
}

export function StudentAppHeader({ application }: StudentAppHeaderProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs overflow-hidden">
      {/* Top Banner Strip */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 border border-slate-300 rounded-[2px]">
            {application.applicationId}
          </span>
          <StatusBadge status={application.currentStatus} />
          <span className="text-xs text-slate-500 font-medium">
            Submitted: {application.submissionDate}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Entitlement Amount:</span>
          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 border border-teal-200 rounded-[2px] flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
            {application.sanctionAmount}
          </span>
        </div>
      </div>

      {/* Main Metadata Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Scholarship Scheme</span>
          </div>
          <div className="font-bold text-[#0A192F] text-xs leading-snug">
            {application.schemeName}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Code: {application.schemeCode}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Enrolled Institution</span>
          </div>
          <div className="font-bold text-slate-800 leading-snug">
            {application.institutionName}
          </div>
          <div className="text-[11px] text-slate-500">
            {application.courseName}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Applicant & Social Group</span>
          </div>
          <div className="font-bold text-slate-800">
            {application.applicantName}
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Category: {application.socialCategory}
          </div>
        </div>

        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Academic Session
          </div>
          <div className="font-bold text-slate-800 text-sm">
            {application.academicYear}
          </div>
          <div className="text-[11px] text-slate-500">
            Nodal Welfare Zone: Ranchi
          </div>
        </div>
      </div>
    </div>
  );
}
