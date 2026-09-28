"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User as UserIcon, GraduationCap, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/applicant/login" || pathname === "/applicant/register";

  useEffect(() => {
    if (isAuthPage) return;
    if (!loading && (!user || !user.roles.some((r) => r.name === "APPLICANT"))) {
      router.push("/applicant/login");
    }
  }, [user, loading, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-base-bg text-text-muted">Loading Secure Dashboard...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-bg text-text-primary font-sans">
      <SiteHeader />
      
      {/* Sub Navigation / Dashboard Header */}
      <div className="bg-slate-50 border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-3 text-sm font-semibold text-slate-600 items-center whitespace-nowrap hide-scrollbar">
            <Link href="/applicant/dashboard" className="flex items-center text-teal-primary border-b-2 border-teal-primary pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Overview
            </Link>
            <Link href="/applicant/profile" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <UserIcon className="w-4 h-4 mr-2" />
              My Profile
            </Link>
            <Link href="/applicant/documents" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              My Documents <span className="ml-2 bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px]">0</span>
            </Link>
            <Link href="/applicant/matches" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Matched Scholarships <span className="ml-2 bg-teal-primary/10 text-teal-primary py-0.5 px-2 rounded-full text-[10px]">AI</span>
            </Link>
            <Link href="/applicant/applied" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              Applied Scholarships <span className="ml-2 bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px]">2</span>
            </Link>
            <Link href="/applicant/awarded" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              Awarded Scholarships
            </Link>
            <Link href="/applicant/applications" className="flex items-center text-white bg-navy rounded-full px-4 py-1 pb-1">
              <Clock className="w-4 h-4 mr-2" />
              My Applications
            </Link>
            <Link href="/applicant/notifications" className="flex items-center hover:text-teal-primary transition-colors pb-1">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              Notifications
            </Link>
          </div>
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
