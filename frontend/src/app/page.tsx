import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logos */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 border-r border-slate-200 pr-6">
                <div className="w-10 h-12 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-500 text-center leading-tight">
                  National<br/>Emblem
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Ministry of Tribal Affairs</span>
                  <span className="text-xs text-slate-500">Government of India</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-xl">N</div>
                <span className="text-xl font-bold text-[#0B4F4C]">Nirikshak</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-[#0B4F4C] font-medium border-b-2 border-[#D4AF37] pb-1">Home</Link>
              <Link href="#" className="text-slate-600 hover:text-[#0B4F4C] font-medium transition-colors">Schemes</Link>
              <Link href="#" className="text-slate-600 hover:text-[#0B4F4C] font-medium transition-colors">About</Link>
              <Link href="#" className="text-slate-600 hover:text-[#0B4F4C] font-medium transition-colors">Accessibility</Link>
              <Link href="#" className="text-slate-600 hover:text-[#0B4F4C] font-medium transition-colors">Contact</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-[#0B4F4C] font-medium hover:underline">Officer Portal</Link>
              <Link href="/login" className="bg-[#0B4F4C] text-white px-5 py-2 rounded font-medium hover:bg-[#073634] transition-colors shadow-sm">
                Applicant Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="bg-[#0A192F] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 pr-0 md:pr-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Empowering Scheduled Tribes through Digital Scholarship Intelligence
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl leading-relaxed">
                An explainable, policy-driven verification and lifecycle management platform for MoTA scholarships.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/login" className="bg-[#D4AF37] text-slate-900 px-8 py-3 rounded text-lg font-bold hover:bg-[#c4a132] transition-colors text-center shadow-md">
                  Apply for Scholarship (NFST/NOS)
                </Link>
                <Link href="/login" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded text-lg font-bold hover:bg-white hover:text-[#0A192F] transition-colors text-center">
                  Track Application
                </Link>
              </div>
            </div>
            <div className="md:w-1/3 mt-12 md:mt-0 flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-white/10 flex items-center justify-center bg-white/5 relative">
                {/* Decorative elements representing AI/Data/Verification */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#D4AF37]/50 animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-12 rounded-full border border-teal-400/30"></div>
                <div className="w-24 h-24 bg-[#0B4F4C] rounded-lg shadow-lg flex items-center justify-center transform rotate-12">
                  <span className="text-[#D4AF37] font-bold text-4xl">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Schemes */}
        <div className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Schemes</h2>
              <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "National Fellowship for ST", desc: "Financial assistance for ST students pursuing M.Phil and Ph.D degrees." },
                { title: "Overseas Scholarship", desc: "Support for ST students pursuing Master's, Ph.D and Post-Doctoral studies abroad." },
                { title: "Post-Matric", desc: "Financial assistance to ST students studying at post-matriculation or post-secondary stage." }
              ].map((scheme, i) => (
                <div key={i} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6 text-[#0B4F4C]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{scheme.title}</h3>
                  <p className="text-slate-600 mb-6">{scheme.desc}</p>
                  <a href="#" className="text-[#0B4F4C] font-semibold hover:underline flex items-center">
                    Read Guidelines
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-700">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center text-white font-bold text-xs">N</div>
                <span className="text-lg font-bold text-white">Nirikshak</span>
              </div>
              <p className="text-sm pr-12">
                A modern platform enabling transparent and efficient verification of scholarship applications for Scheduled Tribes.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">GIGW 3.0 Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility Statement</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Screen Reader Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Information</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">RTI Declaration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; {new Date().getFullYear()} Ministry of Tribal Affairs, Government of India.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <span>Hosted by</span>
              <div className="bg-slate-800 px-3 py-1 rounded border border-slate-700 text-white font-semibold tracking-wider">
                NIC
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
