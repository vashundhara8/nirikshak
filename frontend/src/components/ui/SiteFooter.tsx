"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-navy text-slate-300 py-12 border-t border-teal-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-700">
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded bg-teal-primary flex items-center justify-center text-white font-bold text-sm">
                N
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-none">NIRIKSHAK</span>
                <span className="text-[10px] uppercase text-teal-light font-semibold tracking-wider">Sovereign Intelligence Portal</span>
              </div>
            </div>
            <p className="text-sm pr-12 text-slate-400 max-w-md">
              Designed and developed for Ministry of Tribal Affairs (MoTA), Government of India.
              {t("footer.desc")}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">{t("footer.compliance")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/accessibility" className="hover:text-white transition-colors">{t("footer.gigw")}</Link></li>
              <li><Link href="/accessibility" className="hover:text-white transition-colors">{t("footer.accessibility")}</Link></li>
              <li><Link href="/accessibility" className="hover:text-white transition-colors">{t("footer.screen_reader")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">{t("footer.information")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("footer.rti")}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India. All rights reserved. Content owned by MoTA.</p>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-white">Hyperlinking Policy</Link>
            <Link href="/accessibility" className="hover:text-white">GIGW 3.0 Compliance</Link>
            <Link href="/contact" className="hover:text-white">Helpdesk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
