"use client";

import { useI18n } from "@/lib/i18n";
import React from "react";

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setLocale(e.target.value as any);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-500">🌐</span>
      <select
        value={locale}
        onChange={handleSelect}
        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="or">ଓଡ଼ିଆ (Odia)</option>
        <option value="bn">বাংলা (Bengali)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ (Santali)</option>
      </select>
    </div>
  );
}
