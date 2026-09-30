"use client";

import { useI18n } from "@/lib/i18n";
import React from "react";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLocale(e.target.value as any);
  };

  return (
    <div className="flex items-center space-x-1.5">
      <Globe className="w-3.5 h-3.5 text-slate-700" />
      <select
        value={locale}
        onChange={handleSelect}
        className="bg-transparent border border-stone-300 text-stone-800 text-xs font-medium rounded px-2.5 py-1 focus:ring-1 focus:ring-stone-400 focus:outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="or">ଓଡ଼ᱤଆ (Odia)</option>
        <option value="bn">বাংলা (Bengali)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</option>
      </select>
    </div>
  );
}
