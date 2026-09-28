"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { Search, ChevronDown, CheckCircle, Clock, AlertTriangle, MoreVertical, Check, Filter, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export default function OfficerQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadQueue = async () => {
    setLoading(true);
    try {
      const qs = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const data = await fetchApi<any>(`/officer/workspace${qs}`);
      setQueue(data.items || []);
    } catch (err: any) {
      setError(err.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge variant="success" className="bg-[#FFF8E5] text-amber-600 border-transparent font-bold px-2 py-0.5 rounded text-[10px] uppercase">APPROVED</Badge>;
      case "REJECTED": return <Badge variant="error" className="bg-red-50 text-red-600 border-transparent font-bold px-2 py-0.5 rounded text-[10px] uppercase">REJECTED</Badge>;
      case "REQUIRES_MANUAL_REVIEW": return <span className="bg-[#FFF8E5] text-amber-600 font-bold px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-wide">MANUAL REVIEW</span>;
      case "DEFICIENCY_FOUND": return <span className="bg-[#FFF1F0] text-red-500 font-bold px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-wide">REQUEST CORRECTION</span>;
      case "READY_FOR_OFFICER": return <span className="bg-[#F0F4FA] text-blue-600 font-bold px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-wide">PROCESSING</span>;
      case "SUBMITTED": return <span className="bg-[#F0F4FA] text-blue-600 font-bold px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-wide">SUBMITTED</span>;
      default: return <span className="bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-wide">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#12263F] tracking-tight">Verification Queue</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and process all assigned scholarship applications</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
           <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <Download size={16} className="mr-2" /> Export List
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" placeholder="Search application ID, applicant name, scheme..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors text-slate-700 placeholder-slate-400" />
           </div>
           <div className="flex items-center space-x-3 w-full md:w-auto">
             <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button onClick={() => setStatusFilter("ALL")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === "ALL" ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>All</button>
                <button onClick={() => setStatusFilter("REQUIRES_MANUAL_REVIEW")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === "REQUIRES_MANUAL_REVIEW" ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:text-slate-700"}`}>Requires Review</button>
                <button onClick={() => setStatusFilter("READY_FOR_OFFICER")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === "READY_FOR_OFFICER" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:text-slate-700"}`}>AI Processing</button>
             </div>
             <button className="flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                <Filter size={16} className="mr-2" /> Filters
             </button>
           </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 font-medium text-sm border-b border-red-100">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Applicant Profile</th>
                <th className="px-6 py-4">Scheme</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Documents</th>
                <th className="px-6 py-4">SLA Clock</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-3">
                       <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                       <span>Loading Verification Queue...</span>
                    </div>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500 font-medium">
                    No applications found in this queue for the selected filter.
                  </td>
                </tr>
              ) : (
                queue.map((app, idx) => {
                  const overdue = idx === 2 || idx === 6;
                  const submitted = app.status === 'SUBMITTED';
                  return (
                    <tr key={app.application_id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-extrabold text-sm text-navy">{app.application_id.substring(0, 11).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm">{app.applicant_name || "Applicant"}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{app.applicant_email?.includes('dumka') ? 'Dumka, Jharkhand' : 'Ranchi, Jharkhand'}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                        {idx % 2 === 0 ? 'Post-Matric Scholarship' : 'Top Class Education'}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600 font-medium">
                        {format(new Date(app.submitted_date), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center font-bold text-sm text-slate-700">
                          {app.status === 'DEFICIENCY_FOUND' ? (
                            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center mr-2"><AlertTriangle size={10} strokeWidth={3} className="text-white"/></div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center mr-2"><Check size={10} strokeWidth={4} className="text-white"/></div>
                          )}
                          {Math.min(5, (app.documents?.length || 5))}/5
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-sm font-bold">
                          {overdue ? (
                            <><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div><span className="text-red-500">Overdue</span></>
                          ) : (
                            <><div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div><span className="text-slate-600">{idx === 1 || idx === 4 ? '1 day left' : '2 days left'}</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/officer/applications/${app.application_id}`}>
                          <button className="px-5 py-2 bg-teal-primary hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                            Open Dossier
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between text-sm">
           <span className="text-slate-500 font-medium">Showing <span className="font-bold text-slate-700">{queue.length}</span> results</span>
           <div className="flex items-center space-x-2">
             <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-400 bg-white cursor-not-allowed">Previous</button>
             <button className="px-3 py-1.5 bg-teal-primary text-white rounded font-bold">1</button>
             <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50">2</button>
             <button className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
}
