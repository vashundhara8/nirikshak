import * as React from "react";
import { cn } from "@/lib/utils";
import { OfficialApplicationStatus, OfficialDocumentStatus } from "@/types/scholarship";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: OfficialApplicationStatus | OfficialDocumentStatus | string;
  size?: "sm" | "default";
}

const statusStyles: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  // Official Application Statuses
  Submitted: {
    label: "Submitted",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-500",
  },
  "Under Document Verification": {
    label: "Under Document Verification",
    bg: "bg-sky-50",
    text: "text-sky-900",
    border: "border-sky-300",
    dot: "bg-sky-600",
  },
  "Deficiency Raised": {
    label: "Deficiency Raised",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-300",
    dot: "bg-amber-600",
  },
  "Resubmission Required": {
    label: "Resubmission Required",
    bg: "bg-amber-100",
    text: "text-amber-950",
    border: "border-amber-400",
    dot: "bg-amber-700",
  },
  "Under Institute Verification": {
    label: "Under Institute Verification",
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-300",
    dot: "bg-blue-600",
  },
  "Under Officer Review": {
    label: "Under Officer Review",
    bg: "bg-indigo-50",
    text: "text-indigo-900",
    border: "border-indigo-300",
    dot: "bg-indigo-600",
  },
  "Decision Recorded": {
    label: "Decision Recorded",
    bg: "bg-purple-50",
    text: "text-purple-900",
    border: "border-purple-300",
    dot: "bg-purple-600",
  },
  "Payment Processing": {
    label: "Payment Processing",
    bg: "bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-300",
    dot: "bg-teal-600",
  },
  Completed: {
    label: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-300",
    dot: "bg-emerald-600",
  },

  // Document Verification Statuses
  Verified: {
    label: "Verified",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-300",
    dot: "bg-emerald-600",
  },
  Deficiency: {
    label: "Deficiency",
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-300",
    dot: "bg-amber-600",
  },
  "Pending Verification": {
    label: "Pending Verification",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-500",
  },
  "Under Review": {
    label: "Under Review",
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-300",
    dot: "bg-blue-600",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-300",
    dot: "bg-red-600",
  },
};

export function StatusBadge({
  status,
  size = "default",
  className,
  ...props
}: StatusBadgeProps) {
  const current = statusStyles[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-semibold tracking-tight whitespace-nowrap",
        size === "sm" ? "px-1.5 py-0.5 text-[11px] rounded-[2px]" : "px-2.5 py-0.5 text-xs rounded-[2px]",
        current.bg,
        current.text,
        current.border,
        className
      )}
      {...props}
    >
      <span className={cn("rounded-full shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", current.dot)} />
      {current.label}
    </span>
  );
}
