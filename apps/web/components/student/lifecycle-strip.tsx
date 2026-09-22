import * as React from "react";
import { LifecycleStep } from "@/types/scholarship";
import { Check, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleStripProps {
  steps: LifecycleStep[];
}

export function LifecycleStrip({ steps }: LifecycleStripProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-[2px] p-4 shadow-xs" id="status">
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Statutory Application Lifecycle Progress
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Stage 4 of 6 (Action Pending)
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((step) => {
          const isDone = step.status === "completed";
          const isDeficiency = step.status === "deficiency";
          const isCurrent = step.status === "current";
          const isUpcoming = step.status === "upcoming";

          return (
            <div
              key={step.stepNumber}
              className={cn(
                "p-2.5 rounded-[2px] border text-xs flex flex-col justify-between transition-colors",
                isDone && "bg-emerald-50/50 border-emerald-300 text-emerald-950",
                isDeficiency && "bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-400",
                isCurrent && "bg-blue-50 border-blue-300 text-blue-950",
                isUpcoming && "bg-slate-50 border-slate-200 text-slate-500"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase text-slate-600">
                    Step {step.stepNumber}
                  </span>
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  {isDeficiency && (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  {isCurrent && (
                    <Clock className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
                  )}
                  {isUpcoming && (
                    <span className="w-2 h-2 rounded-full border border-slate-300" />
                  )}
                </div>

                <div className="font-bold text-xs leading-tight">
                  {step.label}
                </div>

                {step.note && (
                  <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                    {step.note}
                  </p>
                )}
              </div>

              {step.timestamp && (
                <div className="mt-2 pt-1 border-t border-slate-200 text-[9px] font-mono text-slate-500">
                  {step.timestamp}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
