"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { User, Bell, LogOut, PhoneCall, Mail, ShieldAlert, Volume2, Search, ArrowRight, ShieldCheck, UserPlus, Info } from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white flex flex-col font-sans">
      {/* 1. Top Govt Bar */}
      <div className="bg-[#111827] text-slate-300 text-[10px] py-1.5 px-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex space-x-4 items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
          <span>Official Portal of Ministry of Tribal Affairs (MoTA)</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center hover:text-white transition-colors border border-slate-700 px-2 py-0.5 rounded bg-slate-800">
            <Volume2 className="w-3 h-3 mr-1" /> High Contrast
          </button>
          <LanguageSelector />
        </div>
      </div>
      
      {/* 2. Main Logo & Contact Block */}
      <div className="max-w-[1400px] mx-auto w-full px-6 py-4 flex flex-col lg:flex-row justify-between items-center bg-white">
        {/* Brand */}
        <div className="flex items-center space-x-4">
          {/* Emblem Placeholder */}
          <Image
            src="/emblem-of-india.svg"
            alt="Emblem of India"
            width={40}
            height={56}
            className="object-contain"
            priority
          />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              GOVERNMENT OF INDIA / GOVERNMENT OF INDIA
            </div>
            <div className="text-2xl font-extrabold text-navy leading-none">
              Ministry of Tribal Affairs
            </div>
            <div className="text-[10px] text-teal-800 font-bold mt-1">
              जनजातीय कार्य मंत्रालय • AI Scholarship & Fellowship Management System
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-3 bg-blue-50/50 border border-blue-100 px-4 py-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-navy leading-none">Direct Benefit Transfer (DBT)</span>
              <span className="text-[10px] text-slate-500">PFMS Aadhaar Seeded Disbursement</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg">
            <PhoneCall className="w-5 h-5 text-green-600" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 leading-none">Toll-Free Helpline</span>
              <span className="text-xs font-bold text-navy">1800-11-7788</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg">
            <Mail className="w-5 h-5 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 leading-none">Grievance Desk</span>
              <span className="text-xs font-bold text-navy">support-mota@nic.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fraud Alert Bar */}
      <div className="bg-red-600 text-white text-xs font-bold py-1.5 px-6 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4" />
        <span>FRAUD PREVENTION ALERT: CAUTION: MoTA never asks for fee or bank OTP over call/SMS. Beware of unverified intermediaries.</span>
      </div>

      {/* 4. Marquee Updates */}
      <div className="bg-navy-light border-b border-slate-700/50 text-white text-[11px] py-1.5 px-6 flex items-center">
        <div className="bg-blue-600 font-bold px-3 py-0.5 rounded flex items-center space-x-1 mr-4 flex-shrink-0">
          <Info className="w-3 h-3" />
          <span>LATEST UPDATES</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="animate-marquee inline-block text-slate-300">
            <span className="text-gold font-bold">★ National Overseas Scholarship (NOS):</span> 20 slots available for Masters & Ph.D. abroad in QS Top 500 universities. Deadline: 15 Nov 2026. &nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp; <span className="text-gold font-bold">★ Top Class Education Scheme:</span> 258 Premier Institutions (IITs, IIMs, AIIMS, NLUs) registered for automated fee reimbursement.
          </p>
        </div>
      </div>

      {/* 5. Main Navigation Bar */}
      <div className="bg-[#111827] text-white shadow-xl relative z-50">
        <div className="max-w-[1400px] mx-auto w-full px-6 flex justify-between items-stretch h-14">
          
          <div className="flex items-center space-x-8">
             {/* NIRIKSHAK Logo Box */}
             <div className="flex items-center space-x-2 py-2">
               <div className="w-10 h-10 bg-teal-500 rounded text-white font-black text-lg flex items-center justify-center">
                 N
               </div>
               <div className="flex flex-col justify-center">
                 <span className="text-sm font-extrabold leading-none tracking-wider">NIRIKSHAK</span>
                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sovereign Intelligence<br/>Portal · MoTA</span>
               </div>
             </div>

             {/* Nav Links */}
             <nav className="hidden lg:flex items-center space-x-1 h-full">
               <Link href="/" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm">Home</Link>
               <Link href="/schemes" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Scholarships</Link>
               <Link href="/schemes" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Fellowship Programs</Link>
               <Link href="/eligibility" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Eligibility Checker</Link>
               <Link href="/track" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Track Application</Link>
               <Link href="/resources" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Resources</Link>
               <Link href="/help" className="px-4 text-sm font-bold text-slate-300 hover:text-white transition-colors">Help Center</Link>
             </nav>
          </div>

          <div className="flex items-center space-x-4 py-2">
            {user ? (
               <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 mr-4">
                     <Bell className="w-5 h-5 text-slate-400" />
                     <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full">2</div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-800 rounded-full pl-3 pr-1 py-1 border border-slate-700">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-white">{user.full_name}</span>
                      <span className="text-[9px] text-gold">{user.phone_number}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.full_name.charAt(0)}
                    </div>
                  </div>
                  <button onClick={logout} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">Log Out</button>
               </div>
            ) : (
               <>
                 <Link href="/admin/login" className="flex items-center text-xs font-bold text-gold border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors">
                   <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Admin Login
                 </Link>
                 <Link href="/applicant/login" className="flex items-center text-xs font-bold text-white hover:text-blue-400 transition-colors px-2">
                   <User className="w-3.5 h-3.5 mr-1.5" /> Student Login
                 </Link>
                 <Link href="/applicant/register" className="flex items-center text-xs font-extrabold text-navy bg-gold hover:bg-yellow-500 rounded-lg px-4 py-2 transition-colors shadow-lg">
                   <UserPlus className="w-3.5 h-3.5 mr-1.5" /> New Registration
                 </Link>
               </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
