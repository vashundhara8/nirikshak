"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.roles.some((r) => r.name === "APPLICANT"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold">Nirikshak</span>
            <nav className="hidden md:flex space-x-4">
              <a href="/applicant/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-slate-800">
                Dashboard
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <UserIcon size={16} />
              <span>{user.full_name}</span>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
