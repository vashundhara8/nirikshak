import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "accent"
    | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-[#0B192C] text-white",
    secondary: "border-transparent bg-slate-100 text-slate-700",
    outline: "text-slate-700 border-slate-300 bg-white",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    destructive: "border-red-200 bg-red-50 text-red-800",
    accent: "border-teal-200 bg-teal-50 text-teal-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
