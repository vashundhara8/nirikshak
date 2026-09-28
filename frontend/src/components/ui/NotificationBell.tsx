"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_STYLES: Record<string, { dot: string; bg: string }> = {
  APPLICATION_APPROVED:  { dot: "bg-green-500",  bg: "bg-green-50 border-green-100" },
  APPLICATION_REJECTED:  { dot: "bg-red-500",    bg: "bg-red-50 border-red-100" },
  CORRECTION_REQUESTED:  { dot: "bg-amber-500",  bg: "bg-amber-50 border-amber-100" },
  VERIFICATION_STARTED:  { dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-100" },
  APPLICATION_SUBMITTED: { dot: "bg-teal-500",   bg: "bg-teal-50 border-teal-100" },
  APPLICATION_ASSIGNED:  { dot: "bg-purple-500", bg: "bg-purple-50 border-purple-100" },
  DEFAULT:               { dot: "bg-slate-400",  bg: "bg-white border-slate-100" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [items, setItems]             = useState<Notification[]>([]);
  const [unread, setUnread]           = useState(0);
  const [loading, setLoading]         = useState(false);
  const panelRef                      = useRef<HTMLDivElement>(null);

  /* ── fetch unread count (lightweight, polls every 30s) ── */
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetchApi<{ count: number }>("/notifications/unread-count");
      setUnread(res.count);
    } catch { /* silently fail — not critical */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  /* ── fetch full list when panel opens ── */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchApi<{ items: Notification[] }>("/notifications?page_size=20")
      .then(r => setItems(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  /* ── close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = async () => {
    await fetchApi("/notifications/read-all", { method: "POST" });
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const markRead = async (id: string) => {
    await fetchApi(`/notifications/${id}/read`, { method: "POST" });
    setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-slate-300" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-2">
              <Bell size={14} className="text-[#005F55]" />
              <span className="text-sm font-extrabold text-[#12263F]">Notifications</span>
              {unread > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-[#005F55] hover:text-[#004040] flex items-center space-x-1 px-2 py-1 rounded hover:bg-teal-50 transition-colors"
                >
                  <CheckCheck size={11} />
                  <span>Mark all read</span>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                <X size={13} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin w-5 h-5 border-2 border-[#005F55] border-t-transparent rounded-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Bell size={28} className="mb-2 text-slate-200" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : items.map(n => {
              const style = TYPE_STYLES[n.notification_type] || TYPE_STYLES.DEFAULT;
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start space-x-3 transition-colors hover:bg-slate-50 ${!n.is_read ? "bg-blue-50/40" : ""}`}
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  {/* Dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot} ${n.is_read ? "opacity-30" : ""}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between space-x-2">
                      <p className={`text-xs font-bold leading-tight ${n.is_read ? "text-slate-500" : "text-slate-800"}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-slate-400 flex-shrink-0 mt-0.5 font-mono">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {n.action_url && (
                      <Link
                        href={n.action_url}
                        onClick={() => { markRead(n.id); setOpen(false); }}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#005F55] hover:text-[#004040] mt-1"
                      >
                        <span>View</span>
                        <ExternalLink size={9} />
                      </Link>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {!n.is_read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Showing {items.length} most recent notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
