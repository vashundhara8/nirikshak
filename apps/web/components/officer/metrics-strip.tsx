import * as React from "react";

export function MetricsStrip() {
  const metrics = [
    { label: "Total Applications Ingested", value: "1,428", sub: "Session 2025-26" },
    { label: "Under Document Verification", value: "312", sub: "Automated Registry Queries" },
    { label: "Deficiency Cases Active", value: "47", sub: "Pending Student Response" },
    { label: "Under Officer Review Queue", value: "89", sub: "Action Required" },
    { label: "Decisions Recorded Today", value: "38", sub: "Dispatched to PFMS" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="bg-white border border-slate-300 rounded-[2px] p-2.5 shadow-xs"
        >
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight truncate">
            {m.label}
          </div>
          <div className="text-xl font-black text-[#0A192F] mt-1">
            {m.value}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
            {m.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
