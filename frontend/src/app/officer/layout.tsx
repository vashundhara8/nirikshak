"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/officer/login" || pathname === "/officer/register";

  useEffect(() => {
    if (isAuthPage) return;
    if (!loading) {
      if (!user) {
        router.push("/officer/login");
        return;
      }
      
      const roles = user.roles.map((r) => r.name);
      if (!roles.includes("INSTITUTE_OFFICER") && !roles.includes("DISTRICT_OFFICER") && !roles.includes("STATE_OFFICER") && !roles.includes("MINISTRY_OFFICER") && !roles.includes("ADMIN")) {
        router.push("/officer/login");
      }
    }
  }, [user, loading, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-base-bg text-text-muted">Loading Secure Workspace...</div>;
  }

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden bg-[#F4F7FA]">
      {/* TOP HEADER - Full Width */}
      <header className="h-16 bg-[#12263F] text-white flex items-center justify-between px-6 border-b border-slate-700/50 flex-shrink-0 z-30">
        <div className="flex items-center space-x-3">
          {/* Emblem Icon (using Shield as placeholder) */}
          <Shield className="text-white w-7 h-7 opacity-90" />
          <span className="font-bold text-xl tracking-tight">NIRIKSHAK</span>
          <span className="text-slate-300 text-sm hidden sm:inline-block border-l border-slate-600 pl-3 ml-1 font-medium">Scholarship Verification & Lifecycle Platform</span>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Live Notification Bell */}
          <NotificationBell />
          
          {/* Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-[#12263F]">
              <UserIcon size={18} />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="font-semibold text-sm leading-tight text-white">{user.full_name}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                {user.roles[0]?.name.replace(/_/g, " ").replace("OFFICER", "Officer")} 
                <span className="opacity-80"> (ID: DO-{user.id.substring(0, 4).toUpperCase()})</span>
              </span>
            </div>
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          
          {/* Language */}
          <div className="flex items-center space-x-2 border border-slate-600 rounded px-2.5 py-1.5 cursor-pointer hover:bg-slate-700 transition-colors">
            <span className="text-xs font-semibold">EN</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-[#12263F] text-slate-300 flex flex-col flex-shrink-0 z-20 shadow-lg">
          <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
            <Link href="/officer/dashboard" className={`flex items-center px-4 py-3 rounded-md text-sm font-semibold transition-colors ${pathname === '/officer/dashboard' ? 'bg-[#005F55] text-white' : 'hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </Link>
            <Link href="/officer/queue" className={`flex items-center px-4 py-3 rounded-md text-sm font-semibold transition-colors ${pathname.includes('/officer/applications') || pathname === '/officer/queue' ? 'bg-[#005F55] text-white' : 'hover:bg-white/5 hover:text-white'}`}>
              <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Verification Queue
            </Link>
            <Link href="/officer/applications" className="flex items-center px-4 py-3 rounded-md text-sm font-semibold hover:bg-white/5 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Applications
            </Link>
            <Link href="/officer/reports" className="flex items-center px-4 py-3 rounded-md text-sm font-semibold hover:bg-white/5 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              Reports
            </Link>
            <div className="pt-4 mt-2 border-t border-slate-700/50">
              <Link href="/officer/profile" className="flex items-center px-4 py-3 rounded-md text-sm font-semibold hover:bg-white/5 hover:text-white transition-colors">
                <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Profile & Settings
              </Link>
              <button onClick={logout} className="w-full flex items-center px-4 py-3 rounded-md text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                <svg className="w-4 h-4 mr-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>
          </nav>
          
          {/* Ministry Graphic Bottom */}
          <div className="p-4 mt-auto border-t border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden pb-8">
            {/* Fake mountains using CSS borders */}
            <div className="absolute bottom-0 w-full h-16 opacity-10 flex items-end">
               <div className="w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white border-r-[40px] border-r-transparent ml-[-20px]"></div>
               <div className="w-0 h-0 border-l-[60px] border-l-transparent border-b-[60px] border-b-white border-r-[60px] border-r-transparent ml-[-30px]"></div>
               <div className="w-0 h-0 border-l-[50px] border-l-transparent border-b-[50px] border-b-white border-r-[50px] border-r-transparent ml-[-20px]"></div>
            </div>
            
            <div className="relative z-10 flex items-center mt-2 opacity-80">
              <Shield className="w-6 h-6 mr-3 opacity-70" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white">Ministry of Tribal Affairs</span>
                <span className="text-[10px] text-slate-400">Government of India</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto bg-[#F4F7FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
