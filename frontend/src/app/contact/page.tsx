"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="text-lg font-bold text-[#0B4F4C]">Nirikshak</span>
            </Link>
            <nav className="hidden md:flex space-x-6 text-sm">
              <Link href="/" className="text-slate-600 hover:text-[#0B4F4C] font-medium">Home</Link>
              <Link href="/schemes" className="text-slate-600 hover:text-[#0B4F4C] font-medium">Schemes</Link>
              <Link href="/about" className="text-slate-600 hover:text-[#0B4F4C] font-medium">About</Link>
              <Link href="/contact" className="text-[#0B4F4C] font-bold border-b-2 border-[#D4AF37]">Contact</Link>
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
            <span className="text-white">Contact</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-slate-300 max-w-2xl">Get in touch with the Nirikshak support team.</p>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Applicant Support</h2>
                <p className="text-sm text-slate-600 mb-4">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  If you are an applicant and need help with your scholarship application, please contact the NIC Help Desk or visit your state's tribal welfare department.
                </p>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <a href="mailto:support@scholarships.gov.in" className="text-teal-700 underline">support@scholarships.gov.in</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>0120-6619540 (NSP Helpline)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🌐</span>
                    <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="text-teal-700 underline">National Scholarship Portal ↗</a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Technical Support (Officers)</h2>
                <p className="text-sm text-slate-600 mb-4">
                  For technical issues with the Nirikshak platform (login problems, document upload failures, verification errors), contact the technical support team.
                </p>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <a href="mailto:nirikshak-support@nic.in" className="text-teal-700 underline">nirikshak-support@nic.in</a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🕐</span>
                    <span>Monday to Friday, 9:00 AM – 6:00 PM IST</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Ministry of Tribal Affairs</h2>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>Shastri Bhawan, New Delhi — 110001</p>
                  <div className="flex items-center space-x-2">
                    <span>🌐</span>
                    <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="text-teal-700 underline">tribal.nic.in ↗</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">RTI / Grievance</h2>
              <p className="text-sm text-slate-500 mb-6">
                For Right to Information requests or formal grievances related to scholarship decisions, contact the Public Information Officer of the Ministry of Tribal Affairs.
              </p>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-2">RTI (Right to Information)</h3>
                  <p>Submit RTI applications through the official portal:</p>
                  <a href="https://rtionline.gov.in" target="_blank" rel="noreferrer" className="text-teal-700 underline mt-1 block">rtionline.gov.in ↗</a>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-2">Public Grievance</h3>
                  <p>Submit grievances through the CPGRAMS portal:</p>
                  <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="text-teal-700 underline mt-1 block">pgportal.gov.in ↗</a>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800 text-xs">
                    <strong>Note:</strong> Nirikshak is an internal verification platform. Individual scholarship eligibility decisions are subject to the official Ministry guidelines and cannot be overridden by this platform.
                  </p>
                </div>
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
