"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
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
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-sm text-slate-600 hover:text-[#0B4F4C]">Home</Link>
              <Link href="/login" className="text-sm text-[#0B4F4C] font-medium hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#0A192F] text-white py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>
        </div>
      </div>

      <main className="flex-grow py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <strong>Notice:</strong> This privacy policy applies to the Nirikshak platform operated by the Ministry of Tribal Affairs. It is not a substitute for the Government of India's general privacy framework. This is an informational document for platform transparency.
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-8">
            {[
              {
                title: "1. Information We Collect",
                body: "Nirikshak collects personal information provided by applicants during the scholarship application process, including name, date of birth, caste category, domicile state, academic records, income information, and uploaded supporting documents. Officer accounts are provisioned by the Ministry and include email address and role information.",
              },
              {
                title: "2. How We Use Information",
                body: "Personal information is used exclusively to process scholarship applications, verify eligibility, detect discrepancies in submitted documents, and enable authorised officers to make informed decisions. We do not use applicant data for advertising, profiling for commercial purposes, or sharing with third parties outside the Ministry.",
              },
              {
                title: "3. Document Storage",
                body: "Uploaded documents are stored in a secure object storage system (MinIO). Access is controlled by role-based permissions. Documents are only accessible to authorised officers for the purpose of scholarship verification. Presigned download URLs are time-limited.",
              },
              {
                title: "4. Access and Security",
                body: "All access to Nirikshak requires authentication. Role-based access control ensures that applicants can only access their own applications, and officers can only access applications within their authorised scope. All data in transit is encrypted using TLS. All sensitive data at rest is stored on secured government-managed infrastructure.",
              },
              {
                title: "5. Data Retention",
                body: "Application data is retained in accordance with the applicable records retention schedule for government scholarship programmes. Verification audit trails are retained permanently for accountability purposes.",
              },
              {
                title: "6. Your Rights",
                body: "As an applicant, you may request access to your own application data. For corrections, write to the designated nodal officer at the Ministry. You may also file an RTI request under the Right to Information Act, 2005.",
              },
              {
                title: "7. Changes to This Policy",
                body: "This policy may be updated from time to time. Material changes will be notified through the platform interface. Continued use of Nirikshak after a policy change constitutes acceptance of the revised policy.",
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
            <Link href="/privacy" className="text-white font-medium">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
