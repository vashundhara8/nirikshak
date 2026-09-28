"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { FileText, PlusCircle, AlertCircle, CheckCircle, Clock, Info, Search, Filter, ChevronRight, FileBadge } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

type Application = {
  application_id: string;
  scheme_code: string;
  academic_year: string;
  status: string;
  created_at: string;
  updated_at: string;
  document_count?: number;
};

export default function AppliedScholarships() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await fetchApi<Application[]>("/applications");
        setApplications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-teal-primary font-bold text-xs tracking-wider mb-2 uppercase">
              <FileBadge className="w-4 h-4" />
              <span>Active Student Submissions</span>
            </div>
            <h1 className="text-3xl font-extrabold text-navy tracking-tight">Applied Scholarships & Fellowships</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-xl leading-relaxed">
              Real-time status of all your submitted scholarship applications. Monitor verification stages, respond to deficiency alerts, and view sanction progression.
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-slate-200 px-4 py-2 rounded-lg text-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Applied</span>
                <span className="block text-2xl font-black text-navy">{applications.length}</span>
             </div>
             <Button href="/schemes" className="font-semibold tracking-wide bg-navy hover:bg-navy-light text-white rounded-lg shadow-lg">
                Apply for Another Scheme <ChevronRight size={16} className="ml-1" />
             </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 font-medium rounded border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Loading your secure dossier...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No Applications Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't submitted any scholarship applications yet. Start a new application to see it tracked here.</p>
          <Button href="/schemes" className="font-bold bg-teal-primary text-white hover:bg-teal-600">Explore Schemes</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app.application_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-bold border border-blue-200">MOTA-{app.scheme_code}-2026-{app.application_id.substring(0, 5).toUpperCase()}</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold border border-slate-200">{app.scheme_code}</span>
                    <span>Applied on: <span className="font-bold text-navy">{format(new Date(app.created_at), "dd MMM yyyy, hh:mm a")}</span></span>
                  </div>
                  {app.status === "REJECTED" ? (
                    <span className="bg-red-50 text-red-600 border border-red-200 px-4 py-1.5 rounded-full text-xs font-bold">Rejected</span>
                  ) : app.status === "APPROVED" ? (
                    <span className="bg-green-50 text-green-600 border border-green-200 px-4 py-1.5 rounded-full text-xs font-bold">Approved</span>
                  ) : (
                    <span className="bg-slate-50 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold">Submitted</span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-navy mb-5 pb-4 border-b border-slate-100">
                  {app.scheme_code === "PRE_MATRIC" ? "Pre-Matric Scholarship Scheme for ST Students (Class IX & X)" : 
                   app.scheme_code === "PM-2022" ? "Post-Matric Scholarship Scheme for ST Students (PMS-ST)" : 
                   "National Scholarship for Higher Education of ST Students (Top Class Education)"}
                </h2>
                
                {/* Data Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                   <div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Applicant Name:</p>
                     <p className="text-sm font-bold text-navy">{user?.full_name || "Applicant"}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scheme Deadline:</p>
                     <p className="text-sm text-slate-600 font-medium">15 December 2026</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Attached Documents:</p>
                     <p className="text-sm text-slate-600 font-medium">{app.document_count || 0} Certificates</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Award / Stipend Benefit:</p>
                     <p className="text-sm text-slate-600 font-medium leading-tight">
                        {app.scheme_code === "PRE_MATRIC" ? "₹3,500 to ₹7,000 per annum directly via DBT" : "Full Non-refundable Course Fees + ₹14,400 / year Maintenance Allowance"}
                     </p>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    Authority: <span className="font-bold text-slate-500">Ministry of Tribal Affairs, GOI</span>
                  </div>
                  <Link href={`/applicant/applications/${app.application_id}`} className="inline-flex items-center px-5 py-2.5 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-full transition-colors shadow-sm">
                    <Clock className="w-3.5 h-3.5 mr-2 text-gold" />
                    Track Live Workflow & Sanctions
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
