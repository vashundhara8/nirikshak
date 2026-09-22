import * as React from "react";
import { Bell, ArrowRight } from "lucide-react";
import { PortalNotice } from "@/types/scholarship";

interface NoticeBannerProps {
  notices: PortalNotice[];
}

export function NoticeBanner({ notices }: NoticeBannerProps) {
  return (
    <div className="border border-slate-200 bg-white rounded-[2px] shadow-xs">
      <div className="bg-[#0A192F] text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Important Notices & Gazette Updates</span>
        </div>
        <span className="text-[11px] text-slate-300 font-mono">Academic Session 2025-26</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4 text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-500 font-medium">
                  {notice.date}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-[2px] font-semibold border ${
                    notice.category === "Urgent"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : notice.category === "Scheme Update"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  {notice.category}
                </span>
                {notice.isNew && (
                  <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-[2px] animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-slate-800 font-medium leading-snug">
                {notice.title}
              </p>
            </div>

            {notice.linkText && (
              <span className="text-teal-700 hover:text-teal-900 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer">
                <span>{notice.linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
