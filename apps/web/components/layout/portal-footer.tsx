import * as React from "react";
import Image from "next/image";

export function PortalFooter() {
  return (
    <footer className="w-full bg-[#0A192F] text-slate-300 border-t-2 border-slate-700 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
          {/* Col 1: Ministry Context */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/nirikshak-logo.png"
                alt="NIRIKSHAK Logo"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <div className="font-extrabold text-white text-sm tracking-tight">
                NIRIKSHAK • Scholarship Verification & Lifecycle Platform
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Designed for the Ministry of Tribal Affairs, Government of India, to provide transparent, explainable, and policy-governed administration of Central Sector and Centrally Sponsored ST scholarship schemes.
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Ministry of Tribal Affairs, Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001
            </div>
          </div>

          {/* Col 2: Related Public Portals */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              Related National Portals
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <span className="hover:text-white cursor-pointer">National Scholarship Portal (NSP)</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">DigiLocker Document Repository</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">Public Financial Management System (PFMS)</span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer">AISHE Institutional Directory</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Helpdesk & Grievance */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">
              Public Service Helpdesk
            </div>
            <div className="text-xs text-slate-300">
              <div className="font-bold text-amber-400">Toll Free: 1800-11-2026</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Working Days: 09:30 AM – 05:30 PM
              </div>
              <div className="text-[11px] text-slate-400">
                Email: support-tribal-scholarship@gov.in
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Legal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 Ministry of Tribal Affairs, Government of India. All rights reserved.
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Accessibility Statement</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Hyperlinking Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
