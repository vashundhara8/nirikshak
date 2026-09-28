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
            <button className="hover:bg-slate-700 px-1 rounded" aria-label="Decrease Font Size">A-</button>
            <button className="hover:bg-slate-700 px-1 rounded" aria-label="Normal Font Size">A</button>
            <button className="hover:bg-slate-700 px-1 rounded" aria-label="Increase Font Size">A+</button>
          </div>
          <LanguageSelector />
        </div>
      </div>
      
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-teal-primary rounded">
            <div className="w-10 h-10 rounded bg-teal-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-navy leading-tight tracking-tight">NIRIKSHAK</span>
              <span className="text-[10px] uppercase text-text-muted font-semibold tracking-wider">MoTA Scholarship Verification Engine</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <Link href="/" className="px-4 py-2 text-sm font-semibold text-teal-primary bg-teal-light rounded">{t("nav.home")}</Link>
            <Link href="/schemes" className="px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 rounded transition-colors">{t("nav.schemes")}</Link>
            <Link href="/about" className="px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 rounded transition-colors">{t("nav.about")}</Link>
            <Link href="/contact" className="px-4 py-2 text-sm font-semibold text-text-primary hover:bg-slate-100 rounded transition-colors">{t("nav.contact")}</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" href="/applicant/login">Applicant Login</Button>
            <Button variant="ghost" href="/officer/login">Officer Login</Button>
            <Button variant="ghost" href="/admin/login">Admin Login</Button>
            <Button variant="primary" href="/applicant/register">{t("auth.register")}</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
