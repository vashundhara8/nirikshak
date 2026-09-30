"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  User,
  Bell,
  PhoneCall,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Info,
  ChevronDown,
  FileSearch,
  CheckSquare,
  FilePlus,
  FileCheck
} from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [appDropdownOpen, setAppDropdownOpen] = useState(false);

  return (
    <header className="bg-white flex flex-col font-sans">
      {/* 1. Top Govt Bar - Light Warm Beige as in screenshot */}
      <div className="bg-[#F6EEDF] text-[#4A4036] text-[11px] py-1 px-8 flex justify-between items-center border-b border-[#E8DEC9]">
        <div className="flex space-x-2 items-center font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
          <span>Official Portal of Ministry of Tribal Affairs (MoTA)</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
        </div>
      </div>

      {/* 2. Main Logo & Contact Block */}
      <div className="max-w-[1500px] mx-auto w-full px-8 py-3.5 flex flex-col lg:flex-row justify-between items-center bg-white">
        {/* Brand */}
        <div className="flex items-center space-x-4">
          {/* Emblem of India */}
          <Image
            src="/emblem-of-india.svg"
            alt="Emblem of India"
            width={38}
            height={52}
            className="object-contain"
            priority
          />
          
          <div className="h-10 w-[1px] bg-slate-200"></div>

          {/* Nirikshak Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="NIRIKSHAK Logo"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </Link>

          <div className="h-10 w-[1px] bg-slate-200"></div>

          {/* Ministry Title Text */}
          <div className="flex flex-col justify-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
              GOVERNMENT OF INDIA
            </div>
            <div className="text-xl font-bold text-slate-900 leading-none">
              Ministry of Tribal Affairs - AI Scholarship Management
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2.5 bg-blue-50/60 border border-blue-100/80 px-3.5 py-1.5 rounded-md">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-900 leading-tight">Direct Benefit Transfer (DBT)</span>
              <span className="text-[9px] text-slate-500 leading-tight">PFMS Aadhaar Seeded Disbursement</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-md">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 leading-tight">Toll-Free Helpline</span>
              <span className="text-[11px] font-bold text-slate-900 leading-tight">1800-11-7788</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-md">
            <Mail className="w-4 h-4 text-amber-500" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 leading-tight">Grievance Desk</span>
              <span className="text-[11px] font-bold text-slate-900 leading-tight">support-mota@nic.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fraud Alert Bar */}
      <div className="bg-[#0B1528] text-white text-[11px] py-1.5 px-8 flex items-center space-x-2 font-medium border-t border-slate-800">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          FRAUD PREVENTION ALERT: CAUTION: MoTA never asks for fee or bank OTP over call/SMS. Beware of unverified intermediaries.
        </span>
      </div>

      {/* 4. Marquee Updates */}
      <div className="bg-white border-y border-slate-200 text-slate-800 text-[11px] py-1.5 px-8 flex items-center">
        <div className="bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded text-[10px] flex items-center space-x-1 mr-4 flex-shrink-0">
          <Info className="w-3 h-3" />
          <span>LATEST UPDATES</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="animate-marquee inline-block text-slate-700">
            <span className="text-amber-600 font-bold">★ National Overseas Scholarship (NOS):</span> 70 slots available for Masters & Ph.D. abroad in QS Top 500 universities. Deadline: 15 Nov 2026. &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; <span className="text-amber-600 font-bold">★ Top Class Education Scheme:</span> 258 Premier Institutions (IITs, IIMs, AIIMS, NLUs) registered for automated fee reimbursement.
          </p>
        </div>
      </div>

      {/* 5. Main Navigation Bar */}
      <div className="bg-[#08172E] text-white shadow-xl relative z-50">
        <div className="max-w-[1500px] mx-auto w-full px-8 flex justify-between items-center h-14">
          <div className="flex items-center space-x-8">
            {/* NIRIKSHAK Logo Branding */}
            <Link href="/" className="flex items-center space-x-3 py-1 hover:opacity-95 transition-opacity">
              <div className="relative w-9 h-9 rounded-full bg-white flex-shrink-0 flex items-center justify-center p-1 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="NIRIKSHAK Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xs font-black leading-none tracking-wider text-white">NIRIKSHAK</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 leading-tight">
                  SOVEREIGN<br />INTELLIGENCE<br />PORTAL · MoTA
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center space-x-2 h-full">
              {/* HOME - active tab with yellow underline */}
              <Link
                href="/"
                className="px-4 py-4 text-xs font-extrabold tracking-wider uppercase text-white relative hover:text-[#E5B54F] transition-colors border-b-2 border-[#E5B54F]"
              >
                HOME
              </Link>

              {/* SCHOLARSHIPS */}
              <Link
                href="/schemes"
                className="px-4 py-4 text-xs font-extrabold tracking-wider uppercase text-slate-300 hover:text-white transition-colors"
              >
                SCHOLARSHIPS
              </Link>

              {/* APPLICATIONS with HOVER DROPDOWN for Track, Eligibility Checker, Apply, etc. */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setAppDropdownOpen(true)}
                onMouseLeave={() => setAppDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center space-x-1.5 px-4 py-4 text-xs font-extrabold tracking-wider uppercase text-slate-300 hover:text-white transition-colors focus:outline-none"
                  aria-expanded={appDropdownOpen}
                >
                  <span>APPLICATIONS</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${appDropdownOpen ? "rotate-180 text-[#E5B54F]" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {appDropdownOpen && (
                  <div
                    className="absolute top-full left-0 w-64 bg-[#0A1D3A] border border-slate-700/80 rounded-b-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Application Services
                    </div>
                    
                    <Link
                      href="/track"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#132A50] hover:text-[#E5B54F] transition-colors"
                    >
                      <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                        <FileSearch className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Track Application</div>
                        <div className="text-[10px] text-slate-400">Real-time scrutiny & DBT status</div>
                      </div>
                    </Link>

                    <Link
                      href="/eligibility"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#132A50] hover:text-[#E5B54F] transition-colors"
                    >
                      <div className="p-1.5 rounded bg-amber-500/10 text-amber-400">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Eligibility Checker</div>
                        <div className="text-[10px] text-slate-400">Instant AI rule evaluation</div>
                      </div>
                    </Link>

                    <Link
                      href="/applicant/login"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#132A50] hover:text-[#E5B54F] transition-colors"
                    >
                      <div className="p-1.5 rounded bg-teal-500/10 text-teal-400">
                        <FilePlus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">New Application</div>
                        <div className="text-[10px] text-slate-400">Apply for NOS, NFST & Schemes</div>
                      </div>
                    </Link>

                    <Link
                      href="/applicant/dashboard"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#132A50] hover:text-[#E5B54F] transition-colors border-t border-slate-800/80"
                    >
                      <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Applicant Dashboard</div>
                        <div className="text-[10px] text-slate-400">Manage submissions & documents</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* RESOURCES */}
              <Link
                href="/resources"
                className="px-4 py-4 text-xs font-extrabold tracking-wider uppercase text-slate-300 hover:text-white transition-colors"
              >
                RESOURCES
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3 py-2">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 mr-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">2</div>
                </div>
                <div className="flex items-center space-x-3 bg-slate-800 rounded-full pl-3 pr-1 py-1 border border-slate-700">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white">{user.full_name || user.email || "User"}</span>
                    {user.phone_number && <span className="text-[9px] text-[#E5B54F]">{user.phone_number}</span>}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {(user.full_name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
                  </div>
                </div>
                <button onClick={logout} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Log Out
                </button>
              </div>
            ) : (
              <>
                {/* Admin Login Button */}
                <Link
                  href="/admin/login"
                  className="flex items-center text-xs font-bold text-[#E5B54F] border border-[#E5B54F]/40 hover:bg-[#E5B54F]/10 rounded-md px-3 py-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#E5B54F]" />
                  <span>Admin Login</span>
                </Link>

                {/* Student Login Button */}
                <Link
                  href="/applicant/login"
                  className="flex items-center text-xs font-bold text-slate-200 border border-slate-600/70 hover:bg-white/5 rounded-md px-3 py-1.5 transition-colors"
                >
                  <User className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
                  <span>Student Login</span>
                </Link>

                {/* New Registration Button - Warm Gold */}
                <Link
                  href="/applicant/register"
                  className="flex items-center text-xs font-extrabold text-slate-900 bg-[#E5B54F] hover:bg-[#d8a842] rounded-md px-3.5 py-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5 text-slate-900" />
                  <span>New Registration</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

