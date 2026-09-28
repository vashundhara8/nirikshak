"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Search, CheckCircle, Clock, AlertCircle, FileText, ShieldCheck, IndianRupee, XCircle } from "lucide-react";

const STATUS_DEMO: Record<string, {
  name: string;
  scheme: string;
  appId: string;
  status: string;
  steps: { label: string; done: boolean; date?: string; active?: boolean }[];
  amount?: string;
}> = {
  "NOS-2026-00123": {
    name: "Arjun Singh Munda",
    scheme: "National Overseas Scholarship (NOS)",
    appId: "NOS-2026-00123",
    status: "Under Review",
    amount: "₹12,84,500",
    steps: [
      { label: "Application Submitted", done: true, date: "12 Aug 2026" },
      { label: "Document Uploaded", done: true, date: "13 Aug 2026" },
      { label: "AI Verification Complete", done: true, date: "14 Aug 2026" },
      { label: "Officer Review", done: false, active: true },
      { label: "Selection Committee", done: false },
      { label: "Sanction Order Issued", done: false },
      { label: "DBT Disbursement", done: false },
    ],
  },
  "NFST-2026-00456": {
    name: "Priya Bai Oraon",
    scheme: "National Fellowship for ST Students (NFST)",
    appId: "NFST-2026-00456",
    status: "Approved",
    amount: "₹31,000/month",
    steps: [
      { label: "Application Submitted", done: true, date: "05 Jul 2026" },
      { label: "Document Uploaded", done: true, date: "06 Jul 2026" },
      { label: "AI Verification Complete", done: true, date: "07 Jul 2026" },
      { label: "Officer Review", done: true, date: "15 Jul 2026" },
      { label: "Selection Committee", done: true, date: "22 Jul 2026" },
      { label: "Sanction Order Issued", done: true, date: "01 Aug 2026" },
      { label: "DBT Disbursement", done: true, date: "10 Aug 2026" },
    ],
  },
};

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof STATUS_DEMO[string] | null | "not_found">(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const found = STATUS_DEMO[query.trim().toUpperCase()];
      setResult(found || "not_found");
      setLoading(false);
    }, 900);
  };

  const completedSteps = result && result !== "not_found"
    ? result.steps.filter((s) => s.done).length
    : 0;
  const totalSteps = result && result !== "not_found" ? result.steps.length : 0;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <SiteHeader />

      <div className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Track Application</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Track Your Application</h1>
          <p className="text-slate-300 max-w-2xl font-medium">
            Enter your Application ID or registered Aadhaar number to view the real-time status of your scholarship application.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">Application ID or Aadhaar Number</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. NOS-2026-00123 or 1234-5678-9012"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
              <Button
                variant="primary"
                onClick={handleSearch}
                className="px-6 h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                {loading ? (
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-2 animate-spin" /> Searching...</span>
                ) : (
                  <span className="flex items-center"><Search className="w-4 h-4 mr-2" /> Track</span>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Try <strong>NOS-2026-00123</strong> or <strong>NFST-2026-00456</strong> for a demo.
            </p>
          </div>

          {/* Result */}
          {result === "not_found" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Application Not Found</h3>
              <p className="text-sm text-red-600">
                No application found with the provided ID. Please verify your Application ID or Aadhaar number and try again.
              </p>
              <Link href="/help" className="inline-block mt-4 text-sm font-bold text-red-700 underline">Need help? Visit Help Center →</Link>
            </div>
          )}

          {result && result !== "not_found" && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 flex items-center justify-between ${
                  result.status === "Approved" ? "bg-teal-700" : "bg-[#041e42]"
                } text-white`}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Application Status</p>
                    <h2 className="text-xl font-black">{result.status}</h2>
                  </div>
                  {result.status === "Approved"
                    ? <CheckCircle className="w-10 h-10 text-teal-200" />
                    : <Clock className="w-10 h-10 text-blue-300" />
                  }
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Applicant</p>
                    <p className="font-bold text-slate-900">{result.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Scheme</p>
                    <p className="font-semibold text-slate-700 text-xs leading-tight">{result.scheme}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Application ID</p>
                    <p className="font-mono font-bold text-slate-900">{result.appId}</p>
                  </div>
                </div>
                {result.amount && (
                  <div className="px-6 pb-5">
                    <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center space-x-3">
                      <IndianRupee className="w-5 h-5 text-teal-700" />
                      <div>
                        <p className="text-xs text-teal-600 font-bold">Award Amount</p>
                        <p className="text-base font-black text-teal-900">{result.amount}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Progress bar */}
                <div className="px-6 pb-5">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{completedSteps} / {totalSteps} steps</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-[#041e42] mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-teal-600" /> Application Timeline
                </h3>
                <div className="space-y-0">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex flex-col items-center mr-4 flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                          step.done
                            ? "bg-teal-600 border-teal-600"
                            : step.active
                            ? "bg-white border-teal-600 animate-pulse"
                            : "bg-white border-slate-200"
                        }`}>
                          {step.done ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : step.active ? (
                            <Clock className="w-4 h-4 text-teal-600" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                          )}
                        </div>
                        {idx < result.steps.length - 1 && (
                          <div className={`w-0.5 h-8 mt-1 ${step.done ? "bg-teal-300" : "bg-slate-100"}`} />
                        )}
                      </div>
                      <div className="pb-6 pt-1">
                        <p className={`text-sm font-bold ${
                          step.done ? "text-slate-800" : step.active ? "text-teal-700" : "text-slate-400"
                        }`}>
                          {step.label}
                          {step.active && <span className="ml-2 text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">In Progress</span>}
                        </p>
                        {step.date && <p className="text-xs text-slate-400 mt-0.5">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800">
                  For queries regarding your application status, contact the helpdesk at <strong>1800-11-7788</strong> or email <a href="mailto:support-mota@nic.in" className="underline">support-mota@nic.in</a>
                </p>
              </div>
            </div>
          )}

          {!result && (
            <div className="grid md:grid-cols-3 gap-5 mt-4">
              {[
                { icon: <Search className="w-6 h-6 text-teal-600" />, title: "Easy Tracking", desc: "Enter your Application ID received after registration on the portal" },
                { icon: <ShieldCheck className="w-6 h-6 text-teal-600" />, title: "Secure & Private", desc: "Your application data is protected under government security protocols" },
                { icon: <Clock className="w-6 h-6 text-teal-600" />, title: "Real-time Updates", desc: "Status updates within minutes of officer actions on your application" },
              ].map((card, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 text-sm">{card.title}</h3>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
