"use client";

import * as React from "react";
import { OfficerVerificationDocket } from "@/types/scholarship";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Scale,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  HelpCircle,
} from "lucide-react";

interface VerificationWorkstationProps {
  docket: OfficerVerificationDocket;
  onRecordDecision?: (decision: string, remarks: string) => void;
}

export function VerificationWorkstation({
  docket,
  onRecordDecision,
}: VerificationWorkstationProps) {
  const [remarks, setRemarks] = React.useState("");
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleAction = (actionType: string) => {
    setLastAction(actionType);
    if (onRecordDecision) {
      onRecordDecision(actionType, remarks);
    }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-[2px] shadow-xs overflow-hidden" id="workstation">
      {/* Workstation Header Bar */}
      <div className="bg-[#0A192F] text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
            Verification Docket • {docket.applicationId}
          </div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Evidence-to-Rule Verification Workstation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-300 font-mono">
            Policy Spec: {docket.policyCheck.policyVersion}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Visual Stepper / Workflow Path Banner */}
        <div className="bg-slate-100 p-2 border border-slate-300 rounded-[2px] flex items-center justify-between text-[11px] font-bold text-slate-700">
          <div className="flex items-center gap-1.5 text-teal-900">
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">1</span>
            <span>Evidence</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-1.5 text-indigo-900">
            <span className="w-4 h-4 rounded-full bg-indigo-800 text-white flex items-center justify-center text-[10px]">2</span>
            <span>Policy Rule</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-1.5 text-amber-900">
            <span className="w-4 h-4 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">3</span>
            <span>Assistive Finding</span>
          </div>
          <span className="text-slate-400">→</span>
          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
            <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px]">4</span>
            <span>Officer Decision</span>
          </div>
        </div>

        {/* SECTION 1: APPLICATION EVIDENCE */}
        <div className="border border-slate-300 rounded-[2px] overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>1. Application Evidence Record</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Document ID: {docket.evidence.documentId}
            </span>
          </div>

          <div className="p-3 text-xs divide-y divide-slate-200">
            <div className="pb-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-500 font-medium">Document / Field:</div>
              <div className="sm:col-span-2 font-bold text-slate-900">
                {docket.evidence.fieldOrDocument}
              </div>
            </div>

            <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-500 font-medium">Source Document:</div>
              <div className="sm:col-span-2 font-mono text-slate-800 truncate">
                {docket.evidence.sourceDocument}
              </div>
            </div>

            <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-500 font-medium">Registry Extracted Fact:</div>
              <div className="sm:col-span-2 font-semibold text-slate-900 bg-slate-50 p-2 border border-slate-200 rounded-[2px]">
                {docket.evidence.extractedValue}
                <div className="text-[10px] text-teal-800 mt-1 font-mono">
                  Source: {docket.evidence.registrySource}
                </div>
              </div>
            </div>

            <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-500 font-medium">Declared in NSP Form:</div>
              <div className="sm:col-span-2 text-slate-800 bg-slate-50 p-2 border border-slate-200 rounded-[2px]">
                {docket.evidence.declaredValue}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <div className="text-slate-500 font-medium">Verification Status:</div>
              <div className="sm:col-span-2">
                <StatusBadge status={docket.evidence.verificationStatus} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: POLICY CHECK */}
        <div className="border border-indigo-200 bg-indigo-50/20 rounded-[2px] overflow-hidden">
          <div className="bg-indigo-900 text-white px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-indigo-300" />
              <span>2. Governing Scheme Policy Rule</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-200">
              Code: {docket.policyCheck.ruleCode}
            </span>
          </div>

          <div className="p-3 text-xs divide-y divide-indigo-100">
            <div className="pb-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-600 font-medium">Rule & Gazette Clause:</div>
              <div className="sm:col-span-2 font-bold text-indigo-950">
                {docket.policyCheck.ruleTitle}
                <div className="text-[11px] font-normal text-slate-600 mt-0.5">
                  {docket.policyCheck.gazetteClause}
                </div>
              </div>
            </div>

            <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-600 font-medium">Expected Statutory Requirement:</div>
              <div className="sm:col-span-2 text-slate-800 font-medium">
                {docket.policyCheck.expectedRequirement}
              </div>
            </div>

            <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="text-slate-600 font-medium">Actual Submitted Evidence:</div>
              <div className="sm:col-span-2 text-slate-800">
                {docket.policyCheck.actualEvidence}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <div className="text-slate-600 font-medium">Policy Rule Result:</div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-[2px] border ${
                    docket.policyCheck.checkResult === "Compliant"
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-950 border-amber-300"
                  }`}
                >
                  {docket.policyCheck.checkResult}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Version: {docket.policyCheck.policyVersion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: AUTOMATED VERIFICATION FINDING (Assistive Layer) */}
        <div className="border border-amber-300 bg-amber-50/50 rounded-[2px] p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 uppercase text-[11px] tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>3. Automated Verification Finding (Assistive Layer)</span>
            </div>
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.2 border border-amber-300 rounded-[2px]">
              Evidence Requires Review • Officer Decision Required
            </span>
          </div>

          <div className="font-bold text-slate-900 leading-snug">
            {docket.automatedFinding.summary}
          </div>

          <p className="text-slate-700 text-[11px] leading-relaxed">
            {docket.automatedFinding.assistiveExplanation}
          </p>

          <div className="pt-1 text-[10px] text-slate-500 italic">
            * Note: System checks provide evidence isolation and rule alignment. Ineligibility or sanction determinations are never executed automatically.
          </div>
        </div>

        {/* SECTION 4: OFFICER ACTION (Human-in-the-Loop) */}
        <div className="border-2 border-[#0A192F] rounded-[2px] overflow-hidden">
          <div className="bg-[#0A192F] text-white px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>4. Officer Review & Statutory Decision</span>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold font-mono">
              Authorized Welfare Officer Sign-off
            </span>
          </div>

          <div className="p-3.5 space-y-3 bg-white text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Official Order / Inquiry Remarks (Recorded in Statutory Ledger)
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter specific statutory rationale, citation, or rectification instructions..."
                className="w-full text-xs p-2 border border-slate-300 rounded-[2px] focus:outline-none focus:border-[#0A192F]"
              />
            </div>

            {lastAction && (
              <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-[2px] text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Recorded: {lastAction} — Dispatched to audit ledger.</span>
              </div>
            )}

            {/* Official Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("Deficiency Notice Issued")}
                className="h-8 px-3 text-xs bg-amber-50 hover:bg-amber-100 border-amber-400 text-amber-950 font-bold gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Issue Deficiency
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("Clarification Requested from Nodal Officer")}
                className="h-8 px-3 text-xs border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
                Request Clarification
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => handleAction("Application Approved & Recommended")}
                className="h-8 px-3 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve / Recommend
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleAction("Escalated to State Directorate")}
                className="h-8 px-3 text-xs border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1.5 ml-auto"
              >
                <Send className="w-3 h-3" />
                Escalate
              </Button>
            </div>
          </div>
        </div>

        {/* Audit Trail Register */}
        <div className="border border-slate-300 rounded-[2px] overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span>Statutory Audit Ledger & Action Provenance</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Immutable Log
            </span>
          </div>

          <div className="p-3 divide-y divide-slate-200 text-xs">
            {docket.auditTrail.map((entry, index) => (
              <div key={index} className="py-2 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 leading-snug">
                    {entry.action}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Actor: <span className="font-semibold">{entry.actor}</span>
                    {entry.notes && ` — Note: "${entry.notes}"`}
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {entry.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
