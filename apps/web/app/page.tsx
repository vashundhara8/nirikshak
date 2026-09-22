import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { NoticeBanner } from "@/components/ui/notice-banner";
import { mockPortalNotices } from "@/data/mock-officer";
import {
  FileText,
  Search,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Users,
  GraduationCap,
  Scale,
  PhoneCall,
} from "lucide-react";

export default function PortalHomePage() {
  const serviceCards = [
    {
      title: "Apply / Continue Application",
      description: "Submit new scholarship application or complete saved draft under MoTA welfare schemes.",
      icon: FileText,
      href: "/student",
      actionText: "Open Application Form",
      category: "Applicant Service",
    },
    {
      title: "Track Application Status",
      description: "Real-time lifecycle tracking of submitted applications from NSP ingestion to DBT payment.",
      icon: Search,
      href: "/student#status",
      actionText: "Check Current Stage",
      category: "Tracking Service",
    },
    {
      title: "Document Status Register",
      description: "Review cross-verification status of uploaded Caste, Income, and Bonafide certificates.",
      icon: FileCheck,
      href: "/student#documents",
      actionText: "View Document Register",
      category: "Registry Service",
    },
    {
      title: "Deficiency Resolution Desk",
      description: "View specific verification findings and re-upload required statutory documents.",
      icon: AlertTriangle,
      href: "/student#deficiencies",
      actionText: "Resolve Active Deficiency",
      category: "Rectification Service",
    },
  ];

  const schemeGuidelines = [
    {
      title: "Post-Matric Scholarship Scheme for ST Students (PMS-ST)",
      code: "MOTA-ST-PMS",
      ceiling: "Annual Family Income <= ₹2,50,000",
      description: "Provides financial assistance to Scheduled Tribe students studying at post-matriculation or post-secondary stages.",
    },
    {
      title: "National Overseas Scholarship for ST Candidates (NOS-ST)",
      code: "MOTA-ST-NOS",
      ceiling: "Family Income <= ₹8,00,000 p.a.",
      description: "Financial award for meritorious ST students pursuing Masters or Ph.D. degrees in top 500 QS-ranked foreign universities.",
    },
    {
      title: "National Fellowship for Higher Education of ST Students",
      code: "MOTA-ST-NF",
      ceiling: "UGC/CSIR-NET JRF qualified",
      description: "Fellowships for ST candidates enrolled in regular M.Phil. and Ph.D. courses in recognized universities and research institutions.",
    },
    {
      title: "Top Class Education Scheme for ST Students",
      code: "MOTA-ST-TCE",
      ceiling: "Annual Family Income <= ₹6,00,000",
      description: "Full tuition fee and living allowance for ST students securing admission in notified premier institutions across India.",
    },
  ];

  return (
    <AppShell role="public">
      <div className="space-y-6 py-2">
        {/* Institutional Service Summary Bar */}
        <div className="bg-white border border-slate-300 rounded-[2px] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <Image
              src="/nirikshak-logo.png"
              alt="NIRIKSHAK Logo"
              width={64}
              height={64}
              className="h-16 w-auto object-contain shrink-0 hidden sm:block"
              priority
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Ministry of Tribal Affairs • Government of India
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight">
                NIRIKSHAK Scholarship Verification & Lifecycle Platform
              </h1>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                National portal for automated evidence verification, policy-governed rule enforcement, and statutory officer decisioning for Scheduled Tribe scholarship schemes.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Link
              href="/student"
              className="px-4 py-2 bg-[#0A192F] hover:bg-[#1E3A5F] text-white text-xs font-bold rounded-[2px] text-center flex items-center justify-center gap-2 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Student Services Portal</span>
            </Link>
            <Link
              href="/officer"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-bold rounded-[2px] text-center flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-700" />
              <span>Officer Verification Desk</span>
            </Link>
          </div>
        </div>

        {/* Important Notices & Gazette Updates */}
        <NoticeBanner notices={mockPortalNotices} />

        {/* Primary Scholarship Services Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Scholarship Public Services
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Central Sector & Centrally Sponsored Schemes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {serviceCards.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-300 rounded-[2px] p-3.5 shadow-xs flex flex-col justify-between hover:border-slate-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 bg-slate-100 border border-slate-200 rounded-[2px] text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {service.category}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-[#0A192F] leading-snug">
                      {service.title}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <Link
                      href={service.href}
                      className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center justify-between group"
                    >
                      <span>{service.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Useful Information & Scheme Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="schemes">
          {/* Scheme Directory (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="border-b border-slate-300 pb-1.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Notified Tribal Welfare Scholarship Schemes
              </h2>
            </div>

            <div className="bg-white border border-slate-300 rounded-[2px] divide-y divide-slate-200">
              {schemeGuidelines.map((scheme, i) => (
                <div key={i} className="p-3 text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 leading-tight">
                      {scheme.title}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded-[2px] border border-slate-200 text-slate-700 w-fit">
                      {scheme.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {scheme.description}
                  </p>
                  <div className="text-[11px] font-semibold text-slate-700 pt-0.5">
                    Eligibility Ceiling: <span className="text-slate-900 font-bold">{scheme.ceiling}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines & Helpdesk (1 col) */}
          <div className="space-y-4" id="help">
            <div className="border-b border-slate-300 pb-1.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Statutory Guidelines & Help
              </h2>
            </div>

            <div className="bg-white border border-slate-300 rounded-[2px] p-4 text-xs space-y-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-600" />
                  <span>Statutory Governance Principles</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Eligibility determinations are made by designated District Welfare Officers in strict accordance with gazetted scheme guidelines.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Mandatory Document Checklist
                </div>
                <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4">
                  <li>Aadhaar Card (Linked with Mobile & Bank)</li>
                  <li>ST Community Certificate issued by SDO/Tehsildar</li>
                  <li>Income Certificate for FY 2024-25</li>
                  <li>Current Institution Bonafide & Fee Receipt</li>
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-2 bg-slate-50 p-2.5 rounded-[2px] border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
                  <span>Toll-Free National Helpdesk</span>
                </div>
                <div className="text-xs font-black text-amber-800 mt-0.5">
                  1800-11-2026
                </div>
                <div className="text-[10px] text-slate-500">
                  9:30 AM to 5:30 PM (Working Days)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
