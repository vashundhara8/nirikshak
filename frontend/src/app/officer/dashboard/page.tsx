"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { Search, ChevronDown, CheckCircle, Clock, AlertTriangle, Shield, ClipboardList, AlertCircle, Calendar, ChevronRight, MoreVertical, Check, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

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
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#12263F] tracking-tight">Verification Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Applications assigned to your verification queue</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2.5">
          <Calendar className="text-slate-400 mr-3 w-5 h-5" />
          <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-700 tracking-tight">Tuesday, 29 September 2026</span>
             <span className="text-[10px] text-slate-500 font-medium mt-0.5">Academic Year 2026-27</span>
          </div>
        </div>
      </div>
      
      {/* Main 2-column layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN (approx 75%) */}
        <div className="flex-1 w-full space-y-6 overflow-hidden">
          
          {/* 4 Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pending */}
            <div className="bg-[#FFF8E5] rounded-xl p-5 border border-amber-100/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-36">
               <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center border border-amber-200/50 text-amber-600">
                     <Clock size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">Pending Verification</span>
               </div>
               <div className="flex items-end justify-between z-10">
                  <div>
                    <span className="text-3xl font-black text-slate-900 leading-none block mb-1">24</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">Applications awaiting<br/>verification</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors mb-2" />
               </div>
            </div>

            {/* Card 2: Under Review */}
            <div className="bg-[#F0F4FA] rounded-xl p-5 border border-blue-100/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-36">
               <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center border border-blue-200/50 text-blue-600">
                     <ClipboardList size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">Under Review</span>
               </div>
               <div className="flex items-end justify-between z-10">
                  <div>
                    <span className="text-3xl font-black text-slate-900 leading-none block mb-1">8</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">Currently being<br/>reviewed</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors mb-2" />
               </div>
            </div>

            {/* Card 3: Corrections */}
            <div className="bg-[#FFF1F0] rounded-xl p-5 border border-red-100/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-36">
               <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center border border-red-200/50 text-red-500">
                     <AlertTriangle size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">Corrections</span>
               </div>
               <div className="flex items-end justify-between z-10">
                  <div>
                    <span className="text-3xl font-black text-slate-900 leading-none block mb-1">12</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">Applicants have submitted<br/>corrections</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors mb-2" />
               </div>
            </div>

            {/* Card 4: Completed */}
            <div className="bg-[#F0FAF5] rounded-xl p-5 border border-green-100/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-36">
               <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center border border-green-200/50 text-green-600">
                     <CheckCircle size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">Completed</span>
               </div>
               <div className="flex items-end justify-between z-10">
                  <div>
                    <span className="text-3xl font-black text-slate-900 leading-none block mb-1">146</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">Verified<br/>applications</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors mb-2" />
               </div>
            </div>
          </div>
          
          {/* Verification Queue Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header inside the table card */}
            <div className="p-5 pb-3">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <div>
                    <h2 className="text-xl font-extrabold text-[#12263F] tracking-tight">Verification Queue</h2>
                    <p className="text-slate-500 text-[13px] mt-1 font-medium">Review and verify scholarship applications</p>
                 </div>
                 <div className="mt-4 md:mt-0 relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input type="text" placeholder="Search application ID, applicant name..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-[6px] text-xs focus:outline-none focus:border-slate-300 transition-colors text-slate-700 placeholder-slate-400" />
                 </div>
               </div>
               
               <div className="flex justify-end mt-4 space-x-2">
                 <div className="relative">
                   <select className="border border-slate-200 text-slate-600 text-[11px] font-bold py-1.5 pl-3 pr-6 rounded-[4px] outline-none bg-white appearance-none cursor-pointer">
                      <option>Status</option>
                   </select>
                   <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="relative">
                   <select className="border border-slate-200 text-slate-600 text-[11px] font-bold py-1.5 pl-3 pr-6 rounded-[4px] outline-none bg-white appearance-none cursor-pointer">
                      <option>Scheme</option>
                   </select>
                   <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="relative">
                   <select className="border border-slate-200 text-slate-600 text-[11px] font-bold py-1.5 pl-3 pr-6 rounded-[4px] outline-none bg-white appearance-none cursor-pointer">
                      <option>Submission Date</option>
                   </select>
                   <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                 </div>
                 <div className="relative">
                   <select className="border border-slate-200 text-slate-600 text-[11px] font-bold py-1.5 pl-3 pr-6 rounded-[4px] outline-none bg-white appearance-none cursor-pointer">
                      <option>Priority</option>
                   </select>
                   <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                 </div>
               </div>
            </div>
            
            {error && (
              <div className="px-5 pb-3">
                <div className="p-3 bg-red-50 text-red-600 rounded text-xs font-semibold">
                  {error}
                </div>
              </div>
            )}
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3 font-semibold">Application ID</th>
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-5 py-3 font-semibold">Scheme</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-center">Documents</th>
                    <th className="px-5 py-3 font-semibold">SLA</th>
                    <th className="px-5 py-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                        Loading verification queue...
                      </td>
                    </tr>
                  ) : queue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                        No applications found in this queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((app, idx) => {
                      const overdue = idx === 2 || idx === 6;
                      const submitted = app.status === 'SUBMITTED';
                      
                      return (
                        <tr key={app.application_id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="font-bold text-xs text-slate-800">{app.application_id.substring(0, 11).toUpperCase()}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800 text-[13px]">{app.applicant_name || "Applicant"}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{app.applicant_email?.includes('dumka') ? 'Dumka, Jharkhand' : 'Ranchi, Jharkhand'}</div>
                          </td>
                          <td className="px-5 py-4 text-[12px] text-slate-600 font-medium">
                            {idx % 2 === 0 ? 'Post-Matric\nScholarship' : 'Top Class Education'}
                          </td>
                          <td className="px-5 py-4 text-[12px] text-slate-600 font-medium">
                            {format(new Date(app.submitted_date), "dd Sep yyyy")}
                          </td>
                          <td className="px-5 py-4">
                            {getStatusBadge(submitted ? 'SUBMITTED' : (idx === 2 ? 'DEFICIENCY_FOUND' : (idx === 5 ? 'READY_FOR_OFFICER' : 'REQUIRES_MANUAL_REVIEW')))}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center font-bold text-[12px] text-slate-700">
                              {idx === 2 ? (
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center mr-1.5"><Check size={8} strokeWidth={4} className="text-white"/></div>
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center mr-1.5"><Check size={8} strokeWidth={4} className="text-white"/></div>
                              )}
                              {Math.min(5, (app.documents?.length || 5))}/5
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center text-[12px] font-bold">
                              {overdue ? (
                                <><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div><span className="text-red-500">Overdue</span></>
                              ) : (
                                <><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></div><span className="text-slate-600">{idx === 1 || idx === 4 ? '1 day' : '2 days'}</span></>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <Link href={`/officer/applications/${app.application_id}`}>
                                <button className="px-4 py-1.5 bg-[#005F55] hover:bg-[#004a43] text-white text-[11px] font-bold rounded-[6px] transition-colors shadow-sm">
                                  Review
                                </button>
                              </Link>
                              <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN (approx 25%) */}
        <div className="w-full xl:w-[320px] 2xl:w-[360px] flex flex-col space-y-6 flex-shrink-0">
          
          {/* Recent Verification Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-[#12263F] text-[13px]">Recent Verification Activity</h3>
                <Link href="#" className="text-[#005F55] text-[11px] font-bold hover:underline flex items-center">View all <ChevronRight size={10} className="ml-0.5" strokeWidth={3} /></Link>
             </div>
             <div className="p-2 space-y-1">
                <div className="p-3 flex items-start space-x-3">
                   <div className="mt-0.5 rounded-full bg-transparent border border-green-500 p-0.5 flex-shrink-0">
                     <CheckCircle size={14} className="text-green-600" strokeWidth={2.5} />
                   </div>
                   <div>
                     <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-1">Application PM-2026-018 approved</p>
                     <p className="text-[10px] text-slate-500 font-medium">29 Sep 2026, 11:24 AM</p>
                   </div>
                </div>
                <div className="p-3 flex items-start space-x-3">
                   <div className="mt-0.5 rounded-full bg-transparent border border-amber-500 p-0.5 flex-shrink-0">
                     <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                   </div>
                   <div>
                     <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-1">PM-2026-021 resubmitted for verification</p>
                     <p className="text-[10px] text-slate-500 font-medium">29 Sep 2026, 10:15 AM</p>
                   </div>
                </div>
                <div className="p-3 flex items-start space-x-3">
                   <div className="mt-0.5 rounded-full bg-transparent border border-red-500 p-0.5 flex-shrink-0">
                     <AlertCircle size={14} className="text-red-500" strokeWidth={2.5} />
                   </div>
                   <div>
                     <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-1">Correction requested for PM-2026-023</p>
                     <p className="text-[10px] text-slate-500 font-medium">28 Sep 2026, 04:32 PM</p>
                   </div>
                </div>
                <div className="p-3 flex items-start space-x-3">
                   <div className="mt-0.5 rounded-full bg-transparent border border-green-500 p-0.5 flex-shrink-0">
                     <CheckCircle size={14} className="text-green-600" strokeWidth={2.5} />
                   </div>
                   <div>
                     <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-1">Application PM-2026-017 approved</p>
                     <p className="text-[10px] text-slate-500 font-medium">28 Sep 2026, 01:11 PM</p>
                   </div>
                </div>
                <div className="p-3 flex items-start space-x-3">
                   <div className="mt-0.5 rounded-full bg-transparent border border-slate-300 p-0.5 flex-shrink-0">
                     <FileText size={14} className="text-slate-500" strokeWidth={2.5} />
                   </div>
                   <div>
                     <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-1">Started review for PM-2026-012</p>
                     <p className="text-[10px] text-slate-500 font-medium">28 Sep 2026, 11:03 AM</p>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Your Work Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-[#12263F] text-[13px]">Your Work Summary</h3>
                <div className="relative">
                  <select className="text-[11px] border border-slate-200 rounded-[4px] py-1 pl-2 pr-5 outline-none text-slate-600 font-bold appearance-none bg-white cursor-pointer"><option>This Week</option></select>
                  <ChevronDown size={10} strokeWidth={3} className="absolute right-1.5 top-1.5 text-slate-400 pointer-events-none" />
                </div>
             </div>
             <div className="p-2 space-y-1">
               <div className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 rounded-md">
                 <div className="flex items-center text-[13px] font-semibold text-slate-700">
                   <svg className="w-4 h-4 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                   Verified
                 </div>
                 <span className="font-black text-slate-800 text-sm">18</span>
               </div>
               <div className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 rounded-md">
                 <div className="flex items-center text-[13px] font-semibold text-slate-700">
                   <AlertTriangle className="w-4 h-4 text-amber-500 mr-3" strokeWidth={2.5} />
                   Corrections Requested
                 </div>
                 <span className="font-black text-slate-800 text-sm">6</span>
               </div>
               <div className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 rounded-md">
                 <div className="flex items-center text-[13px] font-semibold text-slate-700">
                   <svg className="w-4 h-4 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Rejected
                 </div>
                 <span className="font-black text-slate-800 text-sm">2</span>
               </div>
               <div className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 rounded-md">
                 <div className="flex items-center text-[13px] font-semibold text-slate-700">
                   <Clock className="w-4 h-4 text-amber-600 mr-3" strokeWidth={2.5} />
                   Pending
                 </div>
                 <span className="font-black text-slate-800 text-sm">24</span>
               </div>
             </div>
          </div>
          
          {/* Verification Guidelines */}
          <div className="bg-[#E6F4EA] rounded-xl p-5 border border-green-200 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-20">
               <Shield className="w-16 h-16 text-green-700" />
             </div>
             <div className="flex items-center text-green-800 mb-2 font-extrabold text-[13px] relative z-10">
                <Shield className="w-4 h-4 mr-2" strokeWidth={2.5} />
                Verification Guidelines <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </div>
             <p className="text-[11px] font-medium text-green-700 leading-relaxed pr-4 relative z-10">
                Refer to scheme guidelines, eligibility rules and document requirements.
             </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
