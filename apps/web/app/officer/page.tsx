"use client";

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricsStrip } from "@/components/officer/metrics-strip";
import { OfficerAppHeader } from "@/components/officer/officer-app-header";
import { VerificationQueueTable } from "@/components/officer/verification-queue-table";
import { VerificationWorkstation } from "@/components/officer/verification-workstation";
import { mockOfficerDockets } from "@/data/mock-officer";
import { OfficerVerificationDocket } from "@/types/scholarship";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Shield } from "lucide-react";

export default function OfficerPortalPage() {
  const [dockets, setDockets] = React.useState<OfficerVerificationDocket[]>(mockOfficerDockets);
  const [selectedDocket, setSelectedDocket] = React.useState<OfficerVerificationDocket>(
    mockOfficerDockets[0]
  );
  const [activeTab, setActiveTab] = React.useState("queue");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const breadcrumbs = [
    { label: "Portal Home", href: "/" },
    { label: "Officer Verification Desk", href: "/officer" },
    { label: "Queue", href: "/officer" },
    { label: selectedDocket.applicationId, current: true },
  ];

  const handleSelectDocket = (docket: OfficerVerificationDocket) => {
    setSelectedDocket(docket);
    // Smooth scroll down to workstation if on mobile / tablet
    const workstationEl = document.getElementById("workstation");
    if (workstationEl && window.innerWidth < 1280) {
      workstationEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRecordDecision = (decisionType: string, remarksText: string) => {
    setDockets((prev) =>
      prev.map((d) =>
        d.id === selectedDocket.id
          ? {
              ...d,
              auditTrail: [
                {
                  timestamp: "Just now",
                  action: decisionType,
                  actor: "Officer P. K. Murmu (District Welfare Officer)",
                  notes: remarksText || "Statutory review executed.",
                },
                ...d.auditTrail,
              ],
            }
          : d
      )
    );
  };

  const handleSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <AppShell
      role="officer"
      pageTitle="Officer Verification & Statutory Decision Desk"
      pageSubtitle="District Welfare Officer Console • Ranchi District • Ministry of Tribal Affairs"
      breadcrumbs={breadcrumbs}
      activeSidebarTab={activeTab}
      onSelectSidebarTab={setActiveTab}
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            isLoading={isRefreshing}
            className="h-8 px-2.5 text-xs border-slate-300 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Registries</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-2.5 text-xs bg-[#0A192F] hover:bg-[#1E3A5F] font-bold gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Queue Register</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Statutory Governance Strip */}
        <div className="bg-white border border-slate-300 rounded-[2px] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>Statutory Decision Safeguard:</strong> Automated checks provide evidence isolation and rule alignment. Sanction, deficiency referral, or disqualification determinations remain strictly under statutory officer authority.
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-[2px] border border-slate-300 shrink-0">
            Active Rulebook: PMS-ST-2025-v2.3
          </span>
        </div>

        {/* Dense 5-Metric Workflow Strip */}
        <MetricsStrip />

        {/* Selected Application Header */}
        <OfficerAppHeader docket={selectedDocket} />

        {/* 2-Column Workstation Grid: Queue Table (left) & Evidence-to-Rule Workstation (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left: Queue Register Table (5 columns on desktop) */}
          <div className="xl:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Verification Application Register
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Select record to inspect docket
              </span>
            </div>
            <VerificationQueueTable
              dockets={dockets}
              selectedId={selectedDocket.id}
              onSelectDocket={handleSelectDocket}
            />
          </div>

          {/* Right: Core NIRIKSHAK Workstation (7 columns on desktop) */}
          <div className="xl:col-span-7">
            <VerificationWorkstation
              docket={selectedDocket}
              onRecordDecision={handleRecordDecision}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
