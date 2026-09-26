"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
        return;
      }
      
      const roles = user.roles.map((r) => r.name);
      if (!roles.includes("INSTITUTE_OFFICER") && !roles.includes("DISTRICT_OFFICER") && !roles.includes("STATE_OFFICER") && !roles.includes("MINISTRY_OFFICER")) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading Secure Workspace...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Shield className="text-gold-400" size={20} />
              <span className="text-xl font-bold tracking-tight">Nirikshak Officer</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <Link href="/officer/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-slate-800">
                Workspace
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <UserIcon size={16} />
              <span>{user.full_name}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-xs ml-2">
                {user.roles[0]?.name}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
