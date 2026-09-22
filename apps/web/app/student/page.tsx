"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { StudentAppHeader } from "@/components/student/student-app-header";
import { LifecycleStrip } from "@/components/student/lifecycle-strip";
import { DeficiencyActionBox } from "@/components/student/deficiency-action-box";
import { DocumentRegister } from "@/components/student/document-register";
import { mockStudentApplication } from "@/data/mock-student";
import { Button } from "@/components/ui/button";
import { Download, History, PhoneCall } from "lucide-react";

export default function StudentPortalPage() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const app = mockStudentApplication;

  const breadcrumbs = [
    { label: "Portal Home", href: "/" },
    { label: "Student Services", href: "/student" },
    { label: app.applicationId, current: true },
  ];

  return (
    <AppShell
      role="student"
      pageTitle={`Applicant Portal: ${app.applicantName}`}
      pageSubtitle={`Application Reference: ${app.applicationId} • ${app.schemeName}`}
      breadcrumbs={breadcrumbs}
      activeSidebarTab={activeTab}
      onSelectSidebarTab={setActiveTab}
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs border-slate-300 gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Application PDF</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-2.5 text-xs bg-[#0A192F] hover:bg-[#1E3A5F] font-bold"
          >
            PFMS Payment Status
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Application Header */}
        <div id="application">
          <StudentAppHeader application={app} />
        </div>

        {/* Compact 6-Stage Application Lifecycle Progression */}
        <LifecycleStrip steps={app.lifecycleSteps} />

        {/* Active Deficiency Callout Box */}
        <DeficiencyActionBox deficiency={app.activeDeficiency} />

        {/* Government Document Register Table */}
        <DocumentRegister documents={app.documentRegister} />

        {/* Two Column Grid: Official Messages & Helpdesk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="messages">
          {/* Official Notices & Messages (2 cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-300 rounded-[2px] shadow-xs overflow-hidden">
            <div className="bg-[#0A192F] text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-slate-300" />
                <span>Statutory Event Log & Official Communications</span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                Live Government Registry Feed
              </span>
            </div>

            <div className="p-3 divide-y divide-slate-200 text-xs">
              {app.eventLog.map((ev) => (
                <div key={ev.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ev.severity === "warning"
                            ? "bg-amber-600"
                            : ev.severity === "success"
                            ? "bg-emerald-600"
                            : "bg-blue-600"
                        }`}
                      />
                      <span className="font-bold text-slate-900">
                        {ev.subject}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {ev.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] pl-4 leading-relaxed">
                    {ev.details}
                  </p>
                  <div className="text-[10px] text-slate-400 pl-4 font-mono">
                    Authority: {ev.sender}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Helpdesk Card (1 col) */}
          <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs p-4 text-xs space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
              <span>District Welfare Help Desk</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug">
              For assistance with caste re-validation, institute bonafide verification, or DBT bank seeding queries:
            </p>

            <div className="bg-slate-50 p-2.5 rounded-[2px] border border-slate-200 text-[11px] space-y-1">
              <div className="font-bold text-slate-900">
                District Welfare Office, Ranchi
              </div>
              <div className="text-slate-600">
                Collectorate Building, Kutchery Road, Ranchi - 834001
              </div>
              <div className="text-slate-700 font-semibold pt-1">
                Toll Free: 1800-11-2026
              </div>
            </div>

            <div className="text-[10px] text-slate-400">
              Please quote Application Reference <span className="font-mono font-bold text-slate-700">APP-2026-001</span> in all official correspondence.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
