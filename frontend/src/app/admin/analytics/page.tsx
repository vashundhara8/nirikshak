/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  Users, FileText, CheckCircle, XCircle, AlertTriangle,
  Shield, BarChart2, Clock, RefreshCcw, Activity,
  TrendingUp, Database, Eye, ChevronRight
} from "lucide-react";

interface AnalyticsData {
  overview: {
    total_applications: number;
    approved: number;
    rejected: number;
    pending: number;
    under_review: number;
    corrections: number;
    status_distribution: Record<string, number>;
    scheme_distribution: Record<string, number>;
  };
  users: { total_users: number; total_applicants: number; total_officers: number };
  verification: { total_runs_executed: number; pass_rate_percent: number; average_fraud_risk: number };
  findings: { severity_distribution: Record<string, number>; total_findings: number };
  documents: { total_documents: number; total_versions: number };
  officer_actions_30d: { by_type: Record<string, number>; recent: any[] };
  audit_events: any[];
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color.replace("text-", "bg-").replace("600", "100").replace("700", "100").replace("800", "100")}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="text-[#005F55]">{icon}</div>
      <h2 className="text-sm font-extrabold text-[#12263F] uppercase tracking-wider">{title}</h2>
    </div>
  );
}

const ACTION_COLORS: Record<string, string> = {
  APPROVE: "bg-green-100 text-green-700",
  REJECT: "bg-red-100 text-red-700",
  REQUEST_CORRECTION: "bg-amber-100 text-amber-700",
  ACCEPT_VERIFICATION: "bg-blue-100 text-blue-700",
};

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  SUBMITTED: "text-blue-600",
  REQUIRES_MANUAL_REVIEW: "text-amber-600",
  DEFICIENCY_FOUND: "text-orange-600",
  RESUBMISSION_RECEIVED: "text-purple-600",
  VERIFICATION_IN_PROGRESS: "text-cyan-600",
  READY_FOR_OFFICER: "text-teal-600",
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await fetchApi<AnalyticsData>("/admin/analytics");
      setData(d);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Analytics fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/admin/login"); return; }
    const hasAccess = user.roles?.some((r: any) =>
      ["ADMIN", "SYSTEM_ADMIN"].includes(r.name)
    );
    if (!hasAccess) { router.push("/admin/login"); return; }
    fetchData();
  }, [user, authLoading]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin w-10 h-10 border-4 border-[#005F55] border-t-transparent rounded-full" />
          <p className="text-slate-500 font-medium text-sm">Loading Platform Analytics...</p>
        </div>
      </div>
    );
  }

  const totalDecisions = Object.values(data.officer_actions_30d.by_type).reduce((a, b) => a + b, 0);
  const approvalRate = data.overview.total_applications > 0
    ? Math.round((data.overview.approved / data.overview.total_applications) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans">
      {/* Header */}
      <div className="bg-[#12263F] text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Shield size={18} className="text-[#4ade80]" />
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Admin Control Panel</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">Platform Analytics</h1>
            <p className="text-slate-400 text-sm mt-0.5">NIRIKSHAK · Ministry of Tribal Affairs</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right text-xs text-slate-400">
              <p>Last updated</p>
              <p className="font-mono text-white">{lastRefresh.toLocaleTimeString("en-IN")}</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors"
            >
              <RefreshCcw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* ── Row 1: Big Numbers ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<FileText size={20} className="text-blue-600" />} label="Total Applications" value={data.overview.total_applications} sub="All time" color="text-blue-700" />
          <StatCard icon={<Users size={20} className="text-violet-600" />} label="Registered Users" value={data.users.total_users} sub={`${data.users.total_applicants} applicants · ${data.users.total_officers} officers`} color="text-violet-700" />
          <StatCard icon={<CheckCircle size={20} className="text-green-600" />} label="Approved" value={data.overview.approved} sub={`${approvalRate}% approval rate`} color="text-green-700" />
          <StatCard icon={<Activity size={20} className="text-[#005F55]" />} label="Verification Runs" value={data.verification.total_runs_executed} sub={`${data.verification.pass_rate_percent}% pass rate`} color="text-[#005F55]" />
        </div>

        {/* ── Row 2: Status + Scheme + Findings ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Application Pipeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader icon={<BarChart2 size={16} />} title="Application Pipeline" />
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(data.overview.status_distribution).length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No applications yet</p>
              ) : Object.entries(data.overview.status_distribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const pct = Math.round((count / data.overview.total_applications) * 100);
                    const colorClass = STATUS_COLORS[status] || "text-slate-600";
                    return (
                      <div key={status} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold ${colorClass}`}>{status.replace(/_/g, " ")}</span>
                          <span className="text-xs font-mono font-black text-slate-700">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colorClass.replace("text-", "bg-")}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Scheme Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader icon={<TrendingUp size={16} />} title="Scheme Breakdown" />
            </div>
            <div className="p-5 space-y-3">
              {Object.entries(data.overview.scheme_distribution).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No data</p>
              ) : Object.entries(data.overview.scheme_distribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([scheme, count], i) => {
                    const colors = ["bg-[#005F55]", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
                    return (
                      <div key={scheme} className="flex items-center space-x-3">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[i % colors.length]}`} />
                        <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{scheme}</span>
                        <span className="text-xs font-black text-slate-800 tabular-nums">{count}</span>
                      </div>
                    );
                  })}
            </div>
            {/* Summary cards */}
            <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
              {[
                { label: "Pending", val: data.overview.pending, icon: <Clock size={12} />, col: "text-amber-600" },
                { label: "Review", val: data.overview.under_review, icon: <Eye size={12} />, col: "text-blue-600" },
                { label: "Corrn.", val: data.overview.corrections, icon: <AlertTriangle size={12} />, col: "text-orange-600" },
              ].map(({ label, val, icon, col }) => (
                <div key={label} className="p-3 flex flex-col items-center">
                  <div className={`${col} mb-1`}>{icon}</div>
                  <p className={`text-base font-black ${col}`}>{val}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Findings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader icon={<Shield size={16} />} title="AI Verification Findings" />
            </div>
            <div className="p-5">
              {data.findings.total_findings === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No findings yet</p>
              ) : (
                <>
                  {/* Donut-style summary */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { key: "PASS", label: "Passed", color: "bg-green-500", text: "text-green-700" },
                      { key: "FAIL", label: "Failed", color: "bg-red-500", text: "text-red-700" },
                      { key: "MANUAL_REVIEW", label: "Review", color: "bg-amber-500", text: "text-amber-700" },
                    ].map(({ key, label, color, text }) => {
                      const cnt = data.findings.severity_distribution[key] || 0;
                      const pct = data.findings.total_findings > 0 ? Math.round((cnt / data.findings.total_findings) * 100) : 0;
                      return (
                        <div key={key} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                          <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1.5`} />
                          <p className={`text-xl font-black ${text}`}>{cnt}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{label}</p>
                          <p className="text-[10px] text-slate-400">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
                    {[
                      { key: "PASS", color: "bg-green-500" },
                      { key: "MANUAL_REVIEW", color: "bg-amber-500" },
                      { key: "FAIL", color: "bg-red-500" },
                    ].map(({ key, color }) => {
                      const cnt = data.findings.severity_distribution[key] || 0;
                      const pct = data.findings.total_findings > 0 ? (cnt / data.findings.total_findings) * 100 : 0;
                      return pct > 0 ? (
                        <div key={key} className={`${color} h-full`} style={{ width: `${pct}%` }} />
                      ) : null;
                    })}
                  </div>
                  <p className="text-xs text-center text-slate-400 mt-2">{data.findings.total_findings} total findings</p>
                </>
              )}
            </div>
            <div className="border-t border-slate-100 px-5 py-3 bg-slate-50">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Documents Uploaded</span>
                <span className="font-black text-slate-800">{data.documents.total_documents}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Document Versions</span>
                <span className="font-black text-slate-800">{data.documents.total_versions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Officer Actions + Audit Log ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Officer Decisions (30 days) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <SectionHeader icon={<Activity size={16} />} title="Officer Decisions (30 days)" />
              <div className="flex items-center space-x-2">
                {Object.entries(data.officer_actions_30d.by_type).map(([type, cnt]) => (
                  <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded ${ACTION_COLORS[type] || "bg-slate-100 text-slate-600"}`}>
                    {type.replace(/_/g, " ")}: {cnt}
                  </span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {data.officer_actions_30d.recent.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No officer actions in last 30 days</p>
              ) : data.officer_actions_30d.recent.map((action: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-start space-x-3">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded mt-0.5 flex-shrink-0 ${ACTION_COLORS[action.action_type] || "bg-slate-100 text-slate-600"}`}>
                    {action.action_type?.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate">{action.reason || "—"}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {action.created_at ? new Date(action.created_at).toLocaleString("en-IN") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {totalDecisions > 0 && (
              <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
                <span>{totalDecisions} total decisions this month</span>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            )}
          </div>

          {/* Audit Event Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader icon={<Database size={16} />} title="Recent Audit Events" />
            </div>
            <div className="divide-y divide-slate-100">
              {data.audit_events.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No audit events recorded</p>
              ) : data.audit_events.map((event: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-center space-x-3">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.result === "SUCCESS" ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{event.action}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{event.resource_type}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString("en-IN") : ""}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${event.result === "SUCCESS" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {event.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-4">
          <span>NIRIKSHAK Admin Console · All data sourced from live database</span>
          <span className="font-mono">v1.0 · {new Date().toLocaleDateString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
