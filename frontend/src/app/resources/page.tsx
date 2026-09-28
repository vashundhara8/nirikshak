"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { ChevronRight, Download, ExternalLink, FileText, BookOpen, Video, Globe } from "lucide-react";

const categories = [
  {
    title: "Scheme Guidelines & Circulars",
    icon: <FileText className="w-5 h-5 text-teal-600" />,
    items: [
      { title: "NOS 2026-27 Scheme Guidelines", type: "PDF", size: "2.3 MB", date: "Mar 2026", href: "#" },
      { title: "NFST Scheme Guidelines", type: "PDF", size: "1.8 MB", date: "Jan 2026", href: "#" },
      { title: "Post-Matric Scholarship Guidelines", type: "PDF", size: "3.1 MB", date: "Apr 2026", href: "#" },
      { title: "Top Class Education Scheme Circular", type: "PDF", size: "0.9 MB", date: "Feb 2026", href: "#" },
      { title: "Pre-Matric Scholarship Guidelines", type: "PDF", size: "1.5 MB", date: "Jan 2026", href: "#" },
    ],
  },
  {
    title: "Application Forms & Templates",
    icon: <Download className="w-5 h-5 text-blue-600" />,
    items: [
      { title: "NOS Application Form (English)", type: "PDF", size: "0.5 MB", date: "Mar 2026", href: "#" },
      { title: "NOS Application Form (Hindi)", type: "PDF", size: "0.5 MB", date: "Mar 2026", href: "#" },
      { title: "Income Certificate Template", type: "DOCX", size: "0.1 MB", date: "Jan 2026", href: "#" },
      { title: "Caste Certificate Verification Format", type: "PDF", size: "0.2 MB", date: "Feb 2026", href: "#" },
      { title: "Bonafide Student Certificate Format", type: "DOCX", size: "0.1 MB", date: "Jan 2026", href: "#" },
    ],
  },
  {
    title: "User Guides & Help Documents",
    icon: <BookOpen className="w-5 h-5 text-purple-600" />,
    items: [
      { title: "Applicant Portal User Guide", type: "PDF", size: "4.2 MB", date: "Sep 2026", href: "#" },
      { title: "Document Upload Instructions", type: "PDF", size: "1.1 MB", date: "Aug 2026", href: "#" },
      { title: "DBT Payment Tracking Guide", type: "PDF", size: "0.8 MB", date: "Jul 2026", href: "#" },
      { title: "FAQ — Common Application Issues", type: "PDF", size: "0.6 MB", date: "Sep 2026", href: "#" },
    ],
  },
  {
    title: "Tutorial Videos",
    icon: <Video className="w-5 h-5 text-red-500" />,
    items: [
      { title: "How to Register on Nirikshak Portal", type: "VIDEO", size: "8 min", date: "Sep 2026", href: "#" },
      { title: "How to Upload Documents Correctly", type: "VIDEO", size: "5 min", date: "Aug 2026", href: "#" },
      { title: "Tracking Your Application Status", type: "VIDEO", size: "4 min", date: "Aug 2026", href: "#" },
      { title: "Understanding Your Eligibility Result", type: "VIDEO", size: "6 min", date: "Sep 2026", href: "#" },
    ],
  },
];

const externalLinks = [
  { title: "National Scholarship Portal (NSP)", url: "https://scholarships.gov.in", desc: "Official Government of India scholarship portal" },
  { title: "Ministry of Tribal Affairs (MoTA)", url: "https://tribal.nic.in", desc: "Official MoTA website with scheme notifications" },
  { title: "PFMS — Public Financial Management System", url: "https://pfms.nic.in", desc: "Track DBT fund transfers" },
  { title: "QS World University Rankings", url: "https://www.topuniversities.com", desc: "Verify QS Top 500 university status for NOS" },
  { title: "RTI Online Portal", url: "https://rtionline.gov.in", desc: "Submit Right to Information applications" },
  { title: "CPGRAMS — Grievance Portal", url: "https://pgportal.gov.in", desc: "Lodge public grievances with Government of India" },
];

const typeColor: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  DOCX: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <SiteHeader />

      <div className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] text-white py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Resources</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Resources & Downloads</h1>
          <p className="text-slate-300 max-w-2xl font-medium">
            Access official scheme guidelines, application forms, user guides, and tutorial videos to help you navigate the Nirikshak scholarship portal.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Download Categories */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3">
                  <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <h2 className="font-bold text-[#041e42] text-base">{cat.title}</h2>
                </div>
                <ul className="divide-y divide-slate-50">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.date} • {item.size}</p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeColor[item.type] || "bg-slate-100 text-slate-600"}`}>
                          {item.type}
                        </span>
                        <a href={item.href} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <Download className="w-3.5 h-3.5 text-slate-500 hover:text-teal-700" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* External Links */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-3">
              <div className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#041e42] text-base">Important External Links</h2>
                <p className="text-xs text-slate-500">Official government portals and related resources</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 divide-x-0 divide-y md:divide-y-0 divide-slate-100">
              {externalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start p-5 hover:bg-slate-50 transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 text-teal-500 mr-3 flex-shrink-0 mt-0.5 group-hover:text-teal-700" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{link.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
            <strong>Disclaimer:</strong> All documents available here are sourced from official Ministry of Tribal Affairs communications. For the latest circulars and notifications, always refer to the official MoTA website at{" "}
            <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="underline font-bold">tribal.nic.in</a>.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
