"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="text-lg font-bold text-[#0B4F4C]">Nirikshak</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-sm text-slate-600 hover:text-[#0B4F4C]">Home</Link>
              <Link href="/login" className="text-sm text-[#0B4F4C] font-medium hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#0A192F] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>
        </div>
      </div>

      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
            <strong>Notice:</strong> This is a supplementary platform to assist the Ministry of Tribal Affairs. The terms below govern the use of the Nirikshak platform specifically.
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-8">
            {[
              {
                title: "1. Acceptance of Terms",
                body: "By accessing and using the Nirikshak platform, you accept and agree to be bound by these Terms of Use and all applicable laws and regulations of India.",
              },
              {
                title: "2. Purpose of the Platform",
                body: "Nirikshak is an intelligent verification and lifecycle management platform for scholarships administered by the Ministry of Tribal Affairs (MoTA). It assists applicants in submitting documents and assists officers in verifying them against official scheme rules.",
              },
              {
                title: "3. User Responsibilities (Applicants)",
                body: "Applicants are responsible for maintaining the confidentiality of their account credentials. All information and documents submitted must be true, accurate, and authentic. Submission of forged, altered, or fraudulent documents is a criminal offense and will result in immediate rejection, permanent barring from MoTA schemes, and potential legal action.",
              },
              {
                title: "4. AI Assistance Disclaimer",
                body: "Nirikshak utilizes Artificial Intelligence (AI) and Optical Character Recognition (OCR) to assist in document verification. However, AI recommendations are strictly advisory. No automated decisions are made regarding scholarship eligibility. Final decisions are solely at the discretion of authorized government officers based on official policy.",
              },
              {
                title: "5. Intellectual Property",
                body: "The platform's design, source code, architecture, and proprietary verification logic are the intellectual property of the Government of India. Unauthorized reproduction, modification, or distribution is prohibited.",
              },
              {
                title: "6. Limitation of Liability",
                body: "While every effort is made to ensure platform availability and accuracy, the Ministry of Tribal Affairs shall not be liable for any indirect, incidental, or consequential damages arising from the use of, or inability to use, the platform.",
              },
              {
                title: "7. Governing Law",
                body: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in New Delhi.",
              },
            ].map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{section.title}</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>© {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India</p>
          <div className="flex space-x-6">
            <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white font-medium">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
