"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ChevronDown, PhoneCall, Mail, MessageSquare, Search, BookOpen, FileText, AlertCircle } from "lucide-react";

const faqs = [
  {
    category: "Eligibility",
    questions: [
      {
        q: "Who is eligible for the National Overseas Scholarship (NOS)?",
        a: "ST candidates who are first-class graduates (or have a postgraduate degree) with an annual family income below ₹6,00,000 per annum are eligible. The candidate should have secured admission in a QS Top 500 university for Masters or Ph.D. programmes in STEM, Medicine, Agriculture, or Humanities.",
      },
      {
        q: "Is there an age limit for MoTA scholarships?",
        a: "For NOS: 35 years for Masters and 40 years for Ph.D. programs. For NFST: no upper age limit. For Post-Matric Scholarship: no upper age limit. Age relaxation of 5 years applies for SC/ST/PH candidates in some schemes.",
      },
      {
        q: "Can I apply for multiple schemes simultaneously?",
        a: "No. A candidate can only avail of one scholarship/fellowship at a time. Applying for multiple schemes simultaneously is not permitted and will result in automatic disqualification.",
      },
      {
        q: "My family income certificate is from last year — is it still valid?",
        a: "Income certificates should generally be from the current financial year (not more than 12 months old). Certificates older than one year may be rejected during document verification. Consult your district revenue office for a fresh certificate.",
      },
    ],
  },
  {
    category: "Application Process",
    questions: [
      {
        q: "How do I register on the Nirikshak portal?",
        a: "Click 'New Registration' on the top menu, provide your mobile number and Aadhaar number for OTP-based verification, fill in your personal details, and upload the required documents. Your Application ID will be generated automatically after submission.",
      },
      {
        q: "What documents are mandatory for the NOS application?",
        a: "1) ST Caste Certificate from a competent revenue officer. 2) Income Certificate (current FY). 3) Educational qualifications (degree/marksheets). 4) University admission letter from the overseas institution. 5) Aadhaar Card. 6) Bank account details (Aadhaar-seeded).",
      },
      {
        q: "What file formats and sizes are accepted for document uploads?",
        a: "Accepted formats: PDF, JPG, JPEG, PNG. Maximum file size: 2 MB per document. Ensure documents are clearly legible and all corners are visible. Blurry or cropped documents will be flagged during AI verification.",
      },
      {
        q: "How long does the AI verification process take?",
        a: "The AI verification process is typically completed within 5 minutes of document submission. You will receive an SMS and email notification once verification is complete. Complex cases requiring manual review may take 2-3 business days.",
      },
    ],
  },
  {
    category: "Payment & DBT",
    questions: [
      {
        q: "How and when will the scholarship amount be disbursed?",
        a: "All payments are made via Direct Benefit Transfer (DBT) to your Aadhaar-seeded bank account through PFMS. Disbursement typically begins within 30 days of the Sanction Order being issued. For overseas schemes, funds are transferred in foreign currency via SWIFT.",
      },
      {
        q: "My DBT payment failed — what should I do?",
        a: "DBT failures are usually due to mismatched Aadhaar-bank linking or incorrect bank details. Visit your bank branch to ensure Aadhaar seeding is active, update bank details in your portal profile, and raise a ticket via the helpdesk.",
      },
      {
        q: "Can I change my bank account details after submission?",
        a: "Yes, but only before the Sanction Order is issued. Log in to your applicant dashboard, go to Profile > Bank Details, and update your information. Note: the new account must also be Aadhaar-seeded.",
      },
    ],
  },
  {
    category: "Technical Issues",
    questions: [
      {
        q: "I forgot my password — how do I reset it?",
        a: "Click 'Forgot Password' on the login page and enter your registered mobile number. An OTP will be sent for verification. Once verified, you can set a new password. Your Aadhaar number serves as a secondary authentication method.",
      },
      {
        q: "My document upload is failing — what should I check?",
        a: "Ensure the file is under 2 MB, in PDF/JPG/PNG format, and has a clear resolution. Disable browser extensions like ad-blockers that may interfere with file uploads. Try using Google Chrome or Mozilla Firefox for best compatibility.",
      },
    ],
  },
];

export default function HelpPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (faq) =>
        !searchQuery ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <SiteHeader />

      <div className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Help Center</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Help Center</h1>
          <p className="text-slate-300 max-w-2xl font-medium mb-8">
            Find answers to common questions about eligibility, the application process, document requirements, and payments.
          </p>
          {/* Search */}
          <div className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:border-teal-400 transition-all"
              />
            </div>
            <Button
              variant="primary"
              className="px-5 h-12 bg-teal-500 hover:bg-teal-400 text-white font-bold"
              onClick={() => {}}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-grow py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* FAQ Section */}
            <div className="lg:col-span-2">
              {filteredFaqs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No FAQs found for your search.</p>
                  <button onClick={() => setSearchQuery("")} className="mt-3 text-sm font-bold text-teal-700 underline">Clear search</button>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredFaqs.map((cat) => (
                    <div key={cat.category}>
                      <h2 className="text-lg font-black text-[#041e42] mb-4 flex items-center">
                        <span className="w-1 h-5 bg-teal-500 rounded-full mr-3 inline-block" />
                        {cat.category}
                      </h2>
                      <div className="space-y-2">
                        {cat.questions.map((faq, i) => {
                          const key = `${cat.category}-${i}`;
                          const isOpen = openItem === key;
                          return (
                            <div
                              key={i}
                              className={`bg-white rounded-xl border transition-all ${
                                isOpen ? "border-teal-300 shadow-md" : "border-slate-200 shadow-sm"
                              }`}
                            >
                              <button
                                onClick={() => setOpenItem(isOpen ? null : key)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                              >
                                <span className="font-semibold text-sm text-slate-800 pr-4">{faq.q}</span>
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                                    isOpen ? "rotate-180 text-teal-600" : ""
                                  }`}
                                />
                              </button>
                              {isOpen && (
                                <div className="px-5 pb-5">
                                  <div className="pt-2 border-t border-slate-100">
                                    <p className="text-sm text-slate-600 leading-relaxed mt-3">{faq.a}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-teal-700 text-white px-5 py-4">
                  <h3 className="font-bold">Contact Support</h3>
                  <p className="text-teal-200 text-xs mt-1">Available Monday – Friday, 9 AM to 6 PM IST</p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PhoneCall className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toll-Free Helpline</p>
                      <p className="font-bold text-slate-900 text-sm">1800-11-7788</p>
                      <p className="text-xs text-slate-400">All languages supported</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Helpdesk</p>
                      <a href="mailto:support-mota@nic.in" className="font-bold text-teal-700 text-sm hover:underline">support-mota@nic.in</a>
                      <p className="text-xs text-slate-400">Response within 2 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NSP Helpline</p>
                      <p className="font-bold text-slate-900 text-sm">0120-6619540</p>
                      <p className="text-xs text-slate-400">For National Scholarship Portal issues</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-[#041e42] mb-3 text-sm">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { href: "/eligibility", icon: <BookOpen className="w-3.5 h-3.5" />, label: "Check My Eligibility" },
                    { href: "/track", icon: <Search className="w-3.5 h-3.5" />, label: "Track My Application" },
                    { href: "/resources", icon: <FileText className="w-3.5 h-3.5" />, label: "Download Forms & Guides" },
                    { href: "/applicant/login", icon: <FileText className="w-3.5 h-3.5" />, label: "Applicant Login" },
                  ].map((link, i) => (
                    <Link
                      key={i}
                      href={link.href}
                      className="flex items-center space-x-2 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 mb-2" />
                <strong>Fraud Alert:</strong> MoTA and Nirikshak never ask for fees, bank OTPs, or passwords over phone or SMS. Report suspicious contacts to <a href="mailto:fraud-mota@nic.in" className="underline">fraud-mota@nic.in</a>.
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
