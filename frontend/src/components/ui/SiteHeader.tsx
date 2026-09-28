"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "./Button";

export function SiteHeader() {
  const { t } = useI18n();

  return (
    <header className="bg-white border-b border-base-border">
      {/* Top Accessibility / Govt Bar */}
      <div className="bg-navy text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex space-x-4">
          <span>Government of India</span>
          <span className="hidden sm:inline">Ministry of Tribal Affairs</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="#main-content" className="hover:underline sr-only focus:not-sr-only focus:absolute focus:bg-white focus:text-navy focus:p-1">Skip to main content</Link>
          <div className="flex space-x-2 text-[10px] font-bold">
            <button onClick={() => document.documentElement.style.fontSize = '14px'} className="hover:bg-slate-700 px-1 rounded transition-colors" aria-label="Decrease Font Size">A-</button>
            <button onClick={() => document.documentElement.style.fontSize = '16px'} className="hover:bg-slate-700 px-1 rounded transition-colors" aria-label="Normal Font Size">A</button>
            <button onClick={() => document.documentElement.style.fontSize = '18px'} className="hover:bg-slate-700 px-1 rounded transition-colors" aria-label="Increase Font Size">A+</button>
          </div>
          <LanguageSelector />
        </div>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-24">
          {/* Brand - Left */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-teal-primary rounded">
              <div className="w-11 h-11 rounded-lg bg-teal-primary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-sm">
                N
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-navy leading-none tracking-tight">NIRIKSHAK</span>
                <span className="text-[10px] uppercase text-text-muted font-bold tracking-widest mt-1.5">MoTA Scholarship Engine</span>
              </div>
            </Link>
          </div>

          {/* Navigation - Center */}
          <nav className="hidden lg:flex flex-1 justify-center items-center space-x-10" aria-label="Main Navigation">
            <Link href="/" className="text-[14px] font-medium text-navy hover:text-teal-primary transition-colors tracking-wide">{t("nav.home")}</Link>
            <Link href="/schemes" className="text-[14px] font-medium text-navy hover:text-teal-primary transition-colors tracking-wide">{t("nav.schemes")}</Link>
            <Link href="/about" className="text-[14px] font-medium text-navy hover:text-teal-primary transition-colors tracking-wide">{t("nav.about")}</Link>
            <Link href="/contact" className="text-[14px] font-medium text-navy hover:text-teal-primary transition-colors tracking-wide">{t("nav.contact")}</Link>
          </nav>

          {/* Actions - Right */}
          <div className="flex-1 flex justify-end items-center">
            <div className="hidden xl:flex items-center space-x-6">
              {/* Login Dropdown */}
              <div className="relative group py-2">
                <button className="flex items-center space-x-1.5 text-[13px] font-medium text-slate-600 group-hover:text-navy transition-colors focus:outline-none">
                  <span>{t("auth.login").toUpperCase()}</span>
                  <svg className="w-3 h-3 text-slate-400 group-hover:text-navy transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-slate-100 shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                  <Link href="/applicant/login" className="block px-4 py-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-primary transition-colors border-b border-slate-100">
                    {t("auth.applicant_login") || "Applicant Login"}
                  </Link>
                  <Link href="/officer/login" className="block px-4 py-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-primary transition-colors border-b border-slate-100">
                    {t("auth.officer_login") || "Officer Login"}
                  </Link>
                  <Link href="/admin/login" className="block px-4 py-3 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-primary transition-colors">
                    {t("auth.admin_login") || "Admin Login"}
                  </Link>
                </div>
              </div>

              <div className="h-4 w-px bg-slate-300"></div>
              <Link href="/applicant/register" className="text-[14px] font-medium text-navy hover:text-teal-primary transition-colors underline decoration-1 underline-offset-4 uppercase">{t("auth.register")}</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
