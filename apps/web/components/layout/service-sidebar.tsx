"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FileCheck2,
  AlertTriangle,
  Clock,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Inbox,
  Scale,
  Building2,
  CheckSquare,
  History,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSidebarProps {
  role: "student" | "officer";
  isOpen?: boolean;
  onClose?: () => void;
  activeItem?: string;
  onSelectTab?: (tab: string) => void;
}

export function ServiceSidebar({
  role,
  isOpen = true,
  onClose,
  activeItem,
  onSelectTab,
}: ServiceSidebarProps) {
  const pathname = usePathname();

  const studentMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/student" },
    { id: "application", label: "My Application", icon: FileText, href: "/student#application" },
    { id: "documents", label: "Documents Register", icon: FileCheck2, href: "/student#documents", badge: "5" },
    { id: "deficiencies", label: "Deficiencies", icon: AlertTriangle, href: "/student#deficiencies", badge: "1 Action", badgeColor: "bg-amber-100 text-amber-900 border-amber-300" },
    { id: "status", label: "Application Status", icon: Clock, href: "/student#status" },
    { id: "messages", label: "Official Notices & Messages", icon: MessageSquare, href: "/student#messages", badge: "3" },
    { id: "guidelines", label: "Scheme Guidelines", icon: BookOpen, href: "/#schemes" },
    { id: "help", label: "Help & Grievances", icon: HelpCircle, href: "/#help" },
  ];

  const officerMenuItems = [
    { id: "queue", label: "Verification Queue", icon: Inbox, href: "/officer", badge: "89", badgeColor: "bg-indigo-100 text-indigo-950 border-indigo-200" },
    { id: "deficiencies", label: "Deficiency Cases", icon: AlertTriangle, href: "/officer#deficiencies", badge: "47", badgeColor: "bg-amber-100 text-amber-950 border-amber-300" },
    { id: "policy", label: "Policy & Rules Engine", icon: Scale, href: "/officer#policy" },
    { id: "institutions", label: "Institution Validation", icon: Building2, href: "/officer#institutions" },
    { id: "decisions", label: "Recorded Decisions", icon: CheckSquare, href: "/officer#decisions", badge: "38 today", badgeColor: "bg-emerald-100 text-emerald-950 border-emerald-300" },
    { id: "audit", label: "Audit & Provenance Log", icon: History, href: "/officer#audit" },
  ];

  const items = role === "student" ? studentMenuItems : officerMenuItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-[138px] bottom-0 left-0 z-30 w-60 border-r border-slate-300 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-3 space-y-3 overflow-y-auto">
          {/* Institutional Role Context Header */}
          <div className="bg-slate-100 p-2.5 rounded-[2px] border border-slate-300 text-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {role === "student" ? "Applicant Workspace" : "Administrative Workstation"}
            </div>
            <div className="font-extrabold text-[#0A192F] mt-0.5 truncate">
              {role === "student" ? "Anaya Soren (APP-2026-001)" : "Ranchi District Desk"}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {role === "student" ? "PMS-ST 2025-26" : "MoTA Verification Console"}
            </div>
          </div>

          <nav className="space-y-0.5 text-xs font-semibold">
            {items.map((item) => {
              const Icon = item.icon;
              const isSelected = activeItem ? activeItem === item.id : pathname === item.href;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-[2px] border transition-colors",
                    isSelected
                      ? "bg-[#0A192F] text-white border-[#0A192F]"
                      : "text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0",
                        isSelected ? "text-amber-400" : "text-slate-500"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-[2px] border font-bold",
                        isSelected
                          ? "bg-slate-800 text-amber-300 border-slate-700"
                          : item.badgeColor || "bg-slate-100 text-slate-700 border-slate-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Mandate Banner */}
        <div className="p-3 border-t border-slate-300 bg-slate-50 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span>Statutory Mandate</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-tight">
            AI assists with evidence cross-referencing. Rules govern eligibility. Officers decide final sanction.
          </p>
        </div>
      </aside>
    </>
  );
}
