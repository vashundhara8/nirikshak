"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { Search, Filter, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function OfficerDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("REQUIRES_MANUAL_REVIEW");

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
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "REQUIRES_MANUAL_REVIEW": return "bg-amber-100 text-amber-800";
      case "DEFICIENCY_FOUND": return "bg-orange-100 text-orange-800";
      case "READY_FOR_OFFICER": return "bg-blue-100 text-blue-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-900">Verification Workspace</h1>
        
        <div className="flex items-center space-x-2 bg-white rounded-md border border-slate-300 p-1">
          <Filter className="text-slate-400 ml-2" size={16} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 text-sm outline-none bg-transparent font-medium text-slate-700"
          >
            <option value="REQUIRES_MANUAL_REVIEW">Requires Review</option>
            <option value="READY_FOR_OFFICER">Ready for Officer</option>
            <option value="SUBMITTED">Submitted (Queue)</option>
            <option value="RESUBMISSION_RECEIVED">Resubmission Received</option>
            <option value="ALL">All Applications</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
                <th className="p-4">App ID</th>
                <th className="p-4">Applicant</th>
                <th className="p-4">Scheme</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    No applications found in this queue.
                  </td>
                </tr>
              ) : (
                queue.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-xs text-slate-500">{app.application_id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{app.applicant_name || "Applicant"}</div>
                      <div className="text-sm text-slate-500">{app.applicant_email}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{app.scheme_code}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {format(new Date(app.submitted_date), "MMM d, yyyy")}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/officer/applications/${app.application_id}`}
                        className="inline-flex items-center justify-center p-2 text-teal-700 hover:bg-teal-50 rounded-full transition-colors"
                      >
                        <span className="sr-only">View</span>
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
