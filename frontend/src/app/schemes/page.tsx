"use client";

import Link from "next/link";
import Image from "next/image";

export default function SchemesPage() {
  const schemes = [
    {
      id: "national-fellowship",
      code: "NFST-2022",
      title: "National Fellowship for Scheduled Tribes (NFST)",
      badge: "NFST",
      color: "teal",
      eligibility: [
        "Must belong to a Scheduled Tribe community as per the Indian Constitution",
        "Must have passed the UGC-NET / CSIR-NET (JRF) examination",
        "Upper income limit: ₹6 lakh per annum (family)",
        "Valid for pursuing M.Phil or Ph.D at a recognized University",
      ],
      benefits: "Junior Research Fellowship: ₹31,000/month (JRF) · Senior Research Fellowship: ₹35,000/month (SRF) · HRA as per university norms · Contingency grant up to ₹12,000/year",
      duration: "5 years (2 years JRF + 3 years SRF)",
      documents: ["ST Certificate", "Income Certificate", "UGC-NET/CSIR-NET Scorecard", "Admission Letter", "Aadhaar Card", "Bank Passbook"],
      externalUrl: "https://tribal.nic.in/nfst.aspx",
    },
    {
      id: "overseas-scholarship",
      code: "NOS-2022",
      title: "National Overseas Scholarship for Scheduled Tribes",
      badge: "NOS",
      color: "indigo",
      eligibility: [
        "Must belong to a Scheduled Tribe community",
        "Age below 35 years as on the last date of application",
        "Upper income limit: ₹6 lakh per annum (family)",
        "Valid for pursuing Master's, Ph.D or Post-Doctoral studies abroad",
        "Only 20 scholarships awarded per year",
      ],
      benefits: "Tuition Fee (actual, as charged) · Living allowance as per country norms · Travel (economy class return airfare) · Medical insurance · Study materials allowance",
      duration: "Up to 4 years for Ph.D; 2 years for Master's",
      documents: ["ST Certificate", "Income Certificate", "Offer/Admission Letter from Foreign University", "Passport", "Academic Transcripts", "Bank Details"],
      externalUrl: "https://tribal.nic.in/overseas.aspx",
    },
    {
      id: "post-matric",
      code: "PM-2022",
      title: "Post-Matric Scholarship for Scheduled Tribes",
      badge: "PM",
      color: "amber",
      eligibility: [
        "Must belong to a Scheduled Tribe community",
        "Studying at post-matriculation or post-secondary stage",
        "Upper income limit: ₹2.5 lakh per annum (family)",
        "Must be enrolled in a recognized institution",
      ],
      benefits: "Maintenance allowance varies by level: ₹380–₹1,200/month · Study tour charges · Thesis typing/printing · Book allowance",
      duration: "Academic year basis, renewable annually",
      documents: ["ST Certificate", "Income Certificate", "Previous Year Marksheet", "Bonafide Certificate from Institution", "Aadhaar Card", "Bank Passbook"],
      externalUrl: "https://scholarships.gov.in",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colorMap: Record<string, string> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teal:   { badge: "bg-teal-100 text-teal-800", icon: "bg-teal-600", border: "border-teal-200" } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    indigo: { badge: "bg-indigo-100 text-indigo-800", icon: "bg-indigo-600", border: "border-indigo-200" } as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    amber:  { badge: "bg-amber-100 text-amber-800", icon: "bg-amber-500", border: "border-amber-200" } as any,
  };

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
              <Link href="/schemes" className="text-[#0B4F4C] font-bold border-b-2 border-[#D4AF37]">Schemes</Link>
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

      {/* Hero */}
      <div className="bg-[#0A192F] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">Schemes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">MoTA Scholarship Schemes</h1>
          <p className="text-slate-300 max-w-2xl">
            The Ministry of Tribal Affairs administers several scholarship programmes to support Scheduled Tribe students in India at various stages of education.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-amber-800">
            <strong>Informational only.</strong> This page summarises publicly available MoTA scheme guidelines for reference. 
            For authoritative and current eligibility criteria, visit the{" "}
            <a href="https://tribal.nic.in" target="_blank" rel="noreferrer" className="underline font-medium">official Ministry website</a>{" "}
            or{" "}
            <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="underline font-medium">National Scholarship Portal</a>.
          </p>
        </div>
      </div>

      {/* Scheme Cards */}
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {schemes.map((scheme) => {
            const colors = {
              badge: scheme.color === "teal" ? "bg-teal-100 text-teal-800" : scheme.color === "indigo" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800",
              icon: scheme.color === "teal" ? "bg-teal-600" : scheme.color === "indigo" ? "bg-indigo-600" : "bg-amber-500",
              border: scheme.color === "teal" ? "border-teal-200" : scheme.color === "indigo" ? "border-indigo-200" : "border-amber-200",
            };
            return (
              <div key={scheme.id} id={scheme.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {scheme.badge}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{scheme.title}</h2>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                        Scheme Code: {scheme.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={scheme.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm border border-slate-300 text-slate-700 px-4 py-2 rounded font-medium hover:bg-slate-50 transition-colors"
                    >
                      Official Guidelines ↗
                    </a>
                    <Link
                      href="/register"
                      className="text-sm bg-[#0B4F4C] text-white px-4 py-2 rounded font-medium hover:bg-[#073634] transition-colors"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
                <div className="p-6 grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Eligibility</h3>
                    <ul className="space-y-2">
                      {scheme.eligibility.map((e, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                          <span className="text-teal-600 font-bold mt-0.5">✓</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Benefits</h3>
                    <p className="text-sm text-slate-600 mb-3">{scheme.benefits}</p>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2 mt-4">Duration</h3>
                    <p className="text-sm text-slate-600">{scheme.duration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Required Documents</h3>
                    <ul className="space-y-1.5">
                      {scheme.documents.map((doc, i) => (
                        <li key={i} className="flex items-center space-x-2 text-sm text-slate-600">
                          <span className="w-4 h-4 bg-slate-100 rounded flex items-center justify-center text-slate-500 text-xs">📄</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
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
