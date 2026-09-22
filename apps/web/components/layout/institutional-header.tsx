"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstitutionalHeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function InstitutionalHeader({
  onToggleSidebar,
  showSidebarToggle = false,
}: InstitutionalHeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const isStudent = pathname?.startsWith("/student");
  const isOfficer = pathname?.startsWith("/officer");

  return (
    <header className="w-full border-b border-slate-300 bg-white">
      {/* 1. Top Utility Bar */}
      <div className="bg-[#0A192F] text-slate-200 text-xs px-4 sm:px-8 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Text-based institutional identity */}
          <div className="flex items-center gap-2 text-[11px] tracking-wide">
            <span className="font-bold text-white">Government of India</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">भारत सरकार</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-200 font-semibold">
              Ministry of Tribal Affairs
            </span>
            <span className="hidden lg:inline text-slate-500">|</span>
            <span className="hidden lg:inline text-slate-300">
              जनजातीय कार्य मंत्रालय
            </span>
          </div>

          {/* Right: Utility Tools */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-300">
            <Link href="#help" className="hover:text-white transition-colors">
              Help
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Font:</span>
              <button
                type="button"
                className="px-1 py-0.2 hover:bg-slate-800 rounded text-[10px] font-bold"
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                className="px-1 py-0.2 bg-slate-800 text-white rounded text-[10px] font-bold"
                title="Default font size"
              >
                A
              </button>
              <button
                type="button"
                className="px-1 py-0.2 hover:bg-slate-800 rounded text-[10px] font-bold"
                title="Increase font size"
              >
                A+
              </button>
            </div>
            <span className="text-slate-600">|</span>
            <span className="font-semibold text-white">English</span>
            <span className="text-slate-400 cursor-pointer hover:text-white">
              हिन्दी
            </span>
            <span className="text-slate-600">|</span>
            <Link href="#support" className="hover:text-white transition-colors">
              Contact / Support
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Identity Bar */}
      <div className="px-4 sm:px-8 py-3 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showSidebarToggle && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 border border-slate-300 rounded-[2px] text-slate-700 hover:bg-slate-100"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/nirikshak-logo.png"
                alt="NIRIKSHAK Logo"
                width={48}
                height={48}
                className="h-11 w-auto object-contain shrink-0"
                priority
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0A192F]">
                    NIRIKSHAK
                  </span>
                  <span className="hidden sm:inline text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 border border-slate-300 rounded-[2px]">
                    NATIONAL PORTAL
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-normal">
                  Scholarship Verification & Lifecycle Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Right Header Controls: Notifications & User Session */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-[2px] hover:bg-slate-50 relative"
              aria-label="Notices and Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>

            {/* Contextual Role Pill */}
            {isStudent && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
                <div className="text-right">
                  <div className="font-bold text-slate-900">Anaya Soren</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    APP-2026-001 • Applicant
                  </div>
                </div>
                <div className="w-7 h-7 rounded-[2px] bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs">
                  AS
                </div>
              </div>
            )}

            {isOfficer && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
                <div className="text-right">
                  <div className="font-bold text-slate-900">Verification Desk</div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    District Welfare Office, Ranchi
                  </div>
                </div>
                <div className="w-7 h-7 rounded-[2px] bg-[#0A192F] text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
              </div>
            )}

            {!isStudent && !isOfficer && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/student"
                  className="px-2.5 py-1 text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 rounded-[2px] text-slate-800"
                >
                  Student Portal
                </Link>
                <Link
                  href="/officer"
                  className="px-2.5 py-1 text-xs font-semibold bg-[#0A192F] text-white hover:bg-[#1E3A5F] rounded-[2px]"
                >
                  Officer Desk
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden p-1.5 border border-slate-300 rounded-[2px] text-slate-700"
              aria-label="Toggle mobile menu"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Service Navigation Bar */}
      <nav className="bg-[#1E3A5F] text-white px-4 sm:px-8 border-t border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <ul className="hidden md:flex items-center text-xs font-semibold divide-x divide-slate-600/60 border-l border-r border-slate-600/60">
            <li>
              <Link
                href="/"
                className={cn(
                  "block px-4 py-2 hover:bg-[#0A192F] transition-colors",
                  pathname === "/" ? "bg-[#0A192F] text-amber-300 font-bold" : "text-white"
                )}
              >
                Portal Home
              </Link>
            </li>
            <li>
              <Link
                href="/student"
                className={cn(
                  "block px-4 py-2 hover:bg-[#0A192F] transition-colors",
                  isStudent ? "bg-[#0A192F] text-amber-300 font-bold" : "text-white"
                )}
              >
                Student Services
              </Link>
            </li>
            <li>
              <Link
                href="/officer"
                className={cn(
                  "block px-4 py-2 hover:bg-[#0A192F] transition-colors",
                  isOfficer ? "bg-[#0A192F] text-amber-300 font-bold" : "text-white"
                )}
              >
                Officer Verification Desk
              </Link>
            </li>
            <li>
              <Link
                href="/student#status"
                className="block px-4 py-2 hover:bg-[#0A192F] transition-colors text-white"
              >
                Track Application
              </Link>
            </li>
            <li>
              <Link
                href="/#schemes"
                className="block px-4 py-2 hover:bg-[#0A192F] transition-colors text-white"
              >
                Scheme Guidelines
              </Link>
            </li>
            <li>
              <Link
                href="/#help"
                className="block px-4 py-2 hover:bg-[#0A192F] transition-colors text-white"
              >
                Tribal Welfare Helpdesk
              </Link>
            </li>
          </ul>

          <div className="py-2 text-[11px] text-slate-300 hidden lg:block font-mono">
            Direct Public Service Window
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden py-2 space-y-1 border-t border-slate-700 text-xs">
            <Link
              href="/"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-1.5 hover:bg-[#0A192F] text-white"
            >
              Portal Home
            </Link>
            <Link
              href="/student"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-1.5 hover:bg-[#0A192F] text-white"
            >
              Student Services (Anaya Soren)
            </Link>
            <Link
              href="/officer"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-1.5 hover:bg-[#0A192F] text-white"
            >
              Officer Verification Desk (Queue & Review)
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
