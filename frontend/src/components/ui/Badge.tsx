import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  className?: string;
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const baseStyles = "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
  
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-teal-light text-teal-primary",
    outline: "bg-transparent border border-slate-200 text-slate-700",
  };
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
