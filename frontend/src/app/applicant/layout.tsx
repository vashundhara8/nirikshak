"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User as UserIcon, GraduationCap } from "lucide-react";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/applicant/login" || pathname === "/applicant/register";

  useEffect(() => {
    if (isAuthPage) return;
    if (!loading && (!user || !user.roles.some((r) => r.name === "APPLICANT"))) {
      router.push("/");
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
      <header className="bg-navy text-white shadow-md border-b-2 border-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/applicant/dashboard" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-primary rounded">
              <div className="w-8 h-8 rounded bg-teal-primary flex items-center justify-center text-white">
                <GraduationCap size={18} />
              </div>
              <div className="flex flex-col">
                 <span className="text-lg font-bold tracking-tight leading-none">Nirikshak Platform</span>
                 <span className="text-[10px] uppercase text-teal-light tracking-widest font-semibold">Applicant Dashboard</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-slate-200">
              <UserIcon size={16} className="text-teal-light" />
              <span className="font-medium">{user.full_name}</span>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <LogOut size={16} className="mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
