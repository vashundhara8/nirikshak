"use client";

import * as React from "react";
import { OfficerVerificationDocket } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationQueueTableProps {
  dockets: OfficerVerificationDocket[];
  selectedId: string;
  onSelectDocket: (docket: OfficerVerificationDocket) => void;
}

export function VerificationQueueTable({
  dockets,
  selectedId,
  onSelectDocket,
}: VerificationQueueTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  const filtered = dockets.filter((d) => {
    const matchSearch =
      d.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      d.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      d.institutionName.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" || d.currentStage === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs overflow-hidden">
      {/* Controls Strip */}
      <div className="p-3 bg-slate-50 border-b border-slate-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Application ID, Student, or Institution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-[2px] bg-white text-slate-900 focus:outline-none focus:border-[#0A192F]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white text-slate-800 focus:outline-none focus:border-[#0A192F]"
          >
            <option value="ALL">All Stages ({dockets.length})</option>
            <option value="Under Officer Review">Under Officer Review</option>
            <option value="Deficiency Raised">Deficiency Raised</option>
            <option value="Under Institute Verification">Under Institute Verification</option>
            <option value="Decision Recorded">Decision Recorded</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-600 self-center">
          Showing {filtered.length} of {dockets.length} queue records
        </span>
      </div>

      {/* Dense Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2 px-3 border-r border-slate-200">Application ID</th>
              <th className="py-2 px-3 border-r border-slate-200">Applicant</th>
              <th className="py-2 px-3 border-r border-slate-200">Scheme & Institution</th>
              <th className="py-2 px-3 border-r border-slate-200 w-36">Current Stage</th>
              <th className="py-2 px-3 border-r border-slate-200 w-24">Priority</th>
              <th className="py-2 px-3 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((docket, idx) => {
              const isSelected = docket.id === selectedId;

              return (
                <tr
                  key={docket.id}
                  onClick={() => onSelectDocket(docket)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected
                      ? "bg-amber-50/70 border-l-4 border-l-amber-600 font-semibold"
                      : idx % 2 === 0
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50/40 hover:bg-slate-50"
                  )}
                >
                  <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-900">
                    {docket.applicationId}
                  </td>

                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-900 leading-tight">
                      {docket.applicantName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {docket.socialCategory}
                    </div>
                  </td>

                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="text-slate-800 leading-tight truncate max-w-[220px]">
                      {docket.schemeName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                      {docket.institutionName}
                    </div>
                  </td>

                  <td className="py-2 px-3 border-r border-slate-200">
                    <StatusBadge status={docket.currentStage} size="sm" />
                  </td>

                  <td className="py-2 px-3 border-r border-slate-200">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-[2px] border ${
                        docket.priority === "Priority Review"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {docket.priority}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-right">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="h-6 px-2 text-[10px] gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDocket(docket);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isSelected ? "Active" : "Inspect"}</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
