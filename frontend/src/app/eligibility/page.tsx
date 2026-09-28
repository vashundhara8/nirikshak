"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, AlertCircle, ChevronRight, GraduationCap, Users, FileText, IndianRupee } from "lucide-react";

const schemes = [
  {
    id: "nos",
    title: "National Overseas Scholarship (NOS)",
    description: "Full funding for Masters & Ph.D. at QS Top 500 global universities",
    amount: "Full Tuition + USD 15,400 Living Grant + Airfare",
    criteria: {
      caste: "Scheduled Tribe (ST)",
      income: "Below ₹6,00,000 per annum",
      age: "35 years (Masters) / 40 years (Ph.D.)",
      education: "First class graduate degree or equivalent",
      employment: "Not employed in Central/State Government",
    },
  },
  {
    id: "nfst",
    title: "National Fellowship for ST Students (NFST)",
    description: "Research fellowships for M.Phil and Ph.D. at Indian universities",
    amount: "₹31,000 – ₹35,000 per month for up to 5 years",
    criteria: {
      caste: "Scheduled Tribe (ST)",
      income: "Below ₹6,00,000 per annum",
      age: "No upper age limit",
      education: "Post-graduation with 55% marks",
      employment: "Not receiving any other fellowship",
    },
  },
  {
    id: "pmst",
    title: "Post-Matric Scholarship for ST Students",
    description: "Financial support for tribal students pursuing post-matric courses",
    amount: "Maintenance allowance + Course fees",
    criteria: {
      caste: "Scheduled Tribe (ST)",
      income: "Below ₹2,50,000 per annum",
      age: "No upper age limit",
      education: "Passed Class 10 (Matric)",
      employment: "N/A",
    },
  },
];

const questions = [
  {
    id: "caste",
    label: "Do you belong to a Scheduled Tribe (ST) community?",
    options: ["Yes", "No"],
  },
  {
    id: "income",
    label: "What is your annual family income?",
    options: [
      "Below ₹2,50,000",
      "₹2,50,001 – ₹6,00,000",
      "Above ₹6,00,000",
    ],
  },
  {
    id: "education",
    label: "What is your highest educational qualification?",
    options: [
      "Passed Class 10 (Matric)",
      "Post-graduation (55%+ marks)",
      "First class graduate / equivalent",
      "Ph.D. enrolled / completed",
    ],
  },
  {
    id: "purpose",
    label: "What is your scholarship purpose?",
    options: [
      "Overseas Masters or Ph.D. studies",
      "Research fellowship in India (M.Phil/Ph.D.)",
      "Post-matric course in India",
    ],
  },
];

export default function EligibilityPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setShowResults(false);
  };

  const allAnswered = questions.every((q) => answers[q.id]);

  const getEligibleSchemes = () => {
    if (answers.caste !== "Yes") return [];
    const eligible: string[] = [];
    const income = answers.income;
    const education = answers.education;
    const purpose = answers.purpose;

    if (
      purpose === "Overseas Masters or Ph.D. studies" &&
      (income === "Below ₹2,50,000" || income === "₹2,50,001 – ₹6,00,000") &&
      (education === "First class graduate / equivalent" || education === "Ph.D. enrolled / completed")
    ) {
      eligible.push("nos");
    }
    if (
      purpose === "Research fellowship in India (M.Phil/Ph.D.)" &&
      (income === "Below ₹2,50,000" || income === "₹2,50,001 – ₹6,00,000") &&
      (education === "Post-graduation (55%+ marks)" || education === "Ph.D. enrolled / completed")
    ) {
      eligible.push("nfst");
    }
    if (
      purpose === "Post-matric course in India" &&
      income === "Below ₹2,50,000"
    ) {
      eligible.push("pmst");
    }
    return eligible;
  };

  const eligibleSchemes = showResults ? getEligibleSchemes() : [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <SiteHeader />

      <div className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Eligibility Checker</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Eligibility Checker</h1>
          <p className="text-slate-300 max-w-2xl font-medium">
            Answer a few quick questions to find out which MoTA scholarship or fellowship schemes you may qualify for.
            This is a self-assessment tool — final eligibility is determined by the competent authority.
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-teal-700 text-white px-6 py-4">
                  <h2 className="font-bold text-lg">Self-Assessment Questionnaire</h2>
                  <p className="text-teal-200 text-sm mt-1">Complete all {questions.length} questions below</p>
                </div>
                <div className="p-6 space-y-8">
                  {questions.map((q, idx) => (
                    <div key={q.id}>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-[#041e42] text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <p className="font-semibold text-slate-800">{q.label}</p>
                      </div>
                      <div className="ml-9 flex flex-wrap gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(q.id, opt)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                              answers[q.id] === opt
                                ? "bg-teal-700 text-white border-teal-700 shadow-md"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-800"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100">
                    <Button
                      variant="primary"
                      disabled={!allAnswered}
                      onClick={() => setShowResults(true)}
                      className="w-full justify-center h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Check My Eligibility
                    </Button>
                    {!allAnswered && (
                      <p className="text-center text-xs text-slate-400 mt-2">Please answer all questions to continue</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              {!showResults ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                  <h3 className="font-bold text-[#041e42] mb-2">How it works</h3>
                  <ol className="space-y-3 text-sm text-slate-600">
                    {[
                      "Answer the eligibility questions on the left",
                      "Click 'Check My Eligibility'",
                      "Review the matching schemes",
                      "Click 'Apply Now' to begin your application",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 inline mr-1.5 text-amber-600" />
                    <strong>Note:</strong> This tool provides indicative eligibility only. Final determination is subject to document verification.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {answers.caste !== "Yes" ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                      <XCircle className="w-10 h-10 text-red-500 mb-3" />
                      <h3 className="text-lg font-bold text-red-800 mb-2">Not Eligible</h3>
                      <p className="text-sm text-red-700">
                        MoTA scholarship schemes are exclusively available for Scheduled Tribe (ST) community candidates.
                      </p>
                    </div>
                  ) : eligibleSchemes.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                      <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
                      <h3 className="text-lg font-bold text-amber-800 mb-2">No Direct Match Found</h3>
                      <p className="text-sm text-amber-700 mb-4">
                        Based on your answers, no schemes directly match. You may still be eligible — contact the helpdesk.
                      </p>
                      <Link href="/help" className="text-sm font-bold text-amber-800 underline">Visit Help Center →</Link>
                    </div>
                  ) : (
                    <>
                      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center space-x-3">
                        <CheckCircle className="w-7 h-7 text-teal-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-teal-900">
                            {eligibleSchemes.length} Scheme{eligibleSchemes.length > 1 ? "s" : ""} Match Your Profile
                          </p>
                          <p className="text-xs text-teal-700">Subject to document verification</p>
                        </div>
                      </div>
                      {schemes
                        .filter((s) => eligibleSchemes.includes(s.id))
                        .map((scheme) => (
                          <div key={scheme.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              Eligible
                            </span>
                            <h3 className="font-bold text-[#041e42] mt-2 mb-1 text-base leading-tight">{scheme.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{scheme.description}</p>
                            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 mb-4">
                              <strong className="text-[#041e42]">Financial Aid:</strong> {scheme.amount}
                            </div>
                            <Button
                              variant="primary"
                              href="/applicant/login"
                              className="w-full justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm h-10"
                            >
                              Apply for this Scheme
                            </Button>
                          </div>
                        ))}
                    </>
                  )}
                  <button
                    onClick={() => { setAnswers({}); setShowResults(false); }}
                    className="text-sm font-semibold text-slate-500 hover:text-[#041e42] transition-colors underline"
                  >
                    ← Start Over
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#041e42] mb-2">All Available Schemes</h2>
            <p className="text-slate-500 mb-8 text-sm">Complete eligibility criteria for MoTA scholarship schemes administered through the Nirikshak platform.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <div key={scheme.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-[#041e42] mb-2 text-base leading-tight">{scheme.title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{scheme.description}</p>
                  <div className="space-y-2 text-xs">
                    {Object.entries(scheme.criteria).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start gap-2">
                        <span className="text-slate-400 capitalize font-medium flex-shrink-0">{key}:</span>
                        <span className="text-slate-700 font-semibold text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-teal-800 bg-teal-50 rounded-lg px-3 py-2">
                      {scheme.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
