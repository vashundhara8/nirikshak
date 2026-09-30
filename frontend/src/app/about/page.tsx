"use client";

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
              <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="NIRIKSHAK Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-[#0B4F4C]">Nirikshak</span>
            </Link>
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/" className="text-slate-600 hover:text-[#0B4F4C] font-medium">Home</Link>
              <Link href="/schemes" className="text-slate-600 hover:text-[#0B4F4C] font-medium">Schemes</Link>
              <Link href="/about" className="text-[#0B4F4C] font-bold border-b-2 border-[#D4AF37]">About</Link>
              <Link href="/contact" className="text-slate-600 hover:text-[#0B4F4C] font-medium">Contact</Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Link href="/login" className="text-sm text-[#0B4F4C] font-medium hover:underline">Login</Link>
              <Link href="/register" className="text-sm bg-[#0B4F4C] text-white px-4 py-1.5 rounded font-medium hover:bg-[#073634] transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#0A192F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">About</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">About Nirikshak</h1>
          <p className="text-slate-300 max-w-2xl">
            An intelligent, policy-driven scholarship verification platform developed for the Ministry of Tribal Affairs, Government of India.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Core Principle */}
          <div className="bg-[#0B4F4C] text-white rounded-xl p-8 mb-10 text-center">
            <p className="text-sm uppercase tracking-widest text-teal-300 mb-3">Core Principle</p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xl md:text-2xl font-bold">
              <span>🤖 AI ASSISTS</span>
              <span className="text-teal-400">→</span>
              <span>📋 RULES GOVERN</span>
              <span className="text-teal-400">→</span>
              <span>👩‍⚖️ OFFICER DECIDES</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What is Nirikshak?</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Nirikshak is a secure, policy-aware, and explainable intelligent verification and lifecycle management platform designed to assist the Ministry of Tribal Affairs in processing scholarship applications for Scheduled Tribe students across India.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The platform is designed to complement—not replace—existing infrastructure such as the National Scholarship Portal (NSP), DBT, and PFMS, helping officers process applications more consistently, transparently, and efficiently.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Why Nirikshak?</h2>
              <ul className="space-y-3 text-slate-600">
                {[
                  "Thousands of scholarship applications processed each academic year",
                  "Manual verification is time-consuming and inconsistent",
                  "Multilingual document processing for diverse tribal communities",
                  "Transparent, explainable AI that supports human decision-making",
                  "Secure document storage and audit trails for accountability",
                  "Policy engine ensures consistent, fair evaluation across all applications",
                ].map((point, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-teal-600 font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Features */}
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "🔍", title: "OCR & Document Intelligence", desc: "Multilingual OCR supporting English, Hindi, Odia, Bengali, Kannada, and Santali. Automatic field extraction and cross-document validation." },
              { icon: "📋", title: "Policy-Driven Verification", desc: "Deterministic rule engine evaluates each application against official MoTA scheme criteria, producing transparent, explainable results." },
              { icon: "🔒", title: "Secure Document Storage", desc: "All uploaded documents are stored securely with access controls. Presigned URLs provide time-limited download access for authorized personnel." },
              { icon: "🌍", title: "Multilingual Interface", desc: "The platform supports six languages—English, Hindi, Odia, Santali, Bengali, and Kannada—to reach diverse tribal communities." },
              { icon: "📊", title: "Analytics & Monitoring", desc: "Administrative dashboard with real-time metrics on application volumes, verification outcomes, processing times, and deficiency patterns." },
              { icon: "⚖️", title: "Human-in-the-Loop", desc: "All final decisions are made by authorized officers. AI provides evidence and recommendations; officers retain full decision authority." },
            ].map((feat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Data & Privacy */}
          <div className="bg-slate-100 rounded-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Data, Privacy & Security</h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-600 text-sm">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Data Protection</h3>
                <p>All personal data processed by Nirikshak is handled in accordance with applicable Indian data protection laws and Ministry guidelines. Access is restricted on a role and need-to-know basis.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Audit Trails</h3>
                <p>Every access to sensitive documents is logged. Officer decisions are recorded with mandatory justifications. The complete history of each application is preserved for accountability.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Synthetic Data for Development</h3>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <p>The platform's AI and OCR systems are trained and tested exclusively on synthetic documents. No real citizen PII is used in development or testing environments.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">No Automated Decisions</h3>
                <p>Nirikshak does not make autonomous decisions about applicant eligibility. All recommendations are advisory. Final approval or rejection rests with a qualified government officer.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>© {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India</p>
          <div className="flex space-x-6">
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
