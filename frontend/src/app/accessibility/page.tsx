"use client";

import Link from "next/link";

export default function AccessibilityPage() {
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
            <span className="text-white">Accessibility Statement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Accessibility Statement</h1>
          <p className="text-slate-300 max-w-2xl">Our commitment to making Nirikshak accessible to all users.</p>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Our Commitment</h2>
            <p className="text-slate-600 leading-relaxed">
              The Nirikshak platform is developed by the Ministry of Tribal Affairs and is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for all users and apply relevant accessibility standards.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">GIGW 3.0 Conformance</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              This website aims to conform with the Guidelines for Indian Government Websites (GIGW) 3.0, which align with WCAG 2.1 Level AA. These guidelines are developed by the National Informatics Centre (NIC) and apply to all Government of India websites.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Keyboard navigability across all interactive elements",
                "Visible focus indicators for all form controls",
                "ARIA labels for screen reader compatibility",
                "Sufficient color contrast for text legibility",
                "Text alternatives for non-text content",
                "Readable font sizes and scalable text",
                "Multilingual support including Santali (Ol Chiki script)",
                "Form labels and error identification",
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                  <span className="text-teal-600 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Screen Reader Access</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Nirikshak is designed to work with common screen reader software. The following have been tested:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li><strong>NVDA</strong> (Windows) — recommended for Windows users</li>
              <li><strong>JAWS</strong> (Windows) — supported</li>
              <li><strong>VoiceOver</strong> (macOS / iOS) — supported</li>
              <li><strong>TalkBack</strong> (Android) — supported</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Known Limitations</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              While we strive for full accessibility, some areas of the platform may have limitations:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 list-disc pl-5">
              <li>Uploaded PDF documents may not be accessible if they are scanned images without embedded text</li>
              <li>Some complex data visualisations in analytics charts may have limited screen reader support</li>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <li>Santali (Ol Chiki script) rendering depends on the user's operating system having appropriate font support</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Feedback and Contact</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We welcome feedback on the accessibility of Nirikshak. If you experience accessibility barriers, please contact us:
            </p>
            <div className="text-sm text-slate-600 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:accessibility@mota.gov.in" className="text-teal-700 underline">accessibility@mota.gov.in</a></p>
              <p><strong>Telephone:</strong> 1800-xxx-xxxx (Toll Free)</p>
              <p><strong>Response time:</strong> We aim to respond within 5 business days.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Formal Complaints</h2>
            <p className="text-slate-600 leading-relaxed">
              If you are not satisfied with our response, you may contact the{" "}
              <a href="https://www.ceo.gov.in" target="_blank" rel="noreferrer" className="text-teal-700 underline">
                Chief Electoral Officer
              </a>{" "}
              or the relevant nodal officer under the Rights of Persons with Disabilities Act, 2016 (RPWD Act).
            </p>
          </div>

          <p className="text-xs text-slate-500 text-center">
            This statement was last reviewed on {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}.
          </p>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <p>© {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India</p>
          <div className="flex space-x-6">
            <Link href="/accessibility" className="text-white font-medium">Accessibility</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
