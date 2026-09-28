"use client";

import { useAuth } from "@/lib/auth";
import { Sparkles, ArrowRight, CheckCircle, Clock, X } from "lucide-react";
import Link from "next/link";

export default function MatchedScholarships() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 to-navy p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-teal-300 font-bold text-xs tracking-wider mb-2 uppercase">
            <Sparkles className="w-4 h-4" />
            <span>AI Match Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Matched Scholarships</h1>
          <p className="text-teal-100 text-sm max-w-xl">
            Based on your demographic profile (ST) and income, our AI has found these eligible scholarships for you.
          </p>
        </div>
      </div>

      {/* Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Match 1 */}
        <div className="bg-white rounded-2xl border-2 border-teal-500 shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            98% Match
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-1 rounded">PRE_MATRIC</span>
              <span className="text-xs text-slate-500 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> Closes in 14 days</span>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Pre-Matric Scholarship Scheme for ST Students</h2>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
              Financial assistance to ST students studying in classes IX and X to reduce drop-out rates.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Income &lt; ₹2.5 Lakh/yr</div>
              <div className="flex items-center text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Class IX or X Enrollment</div>
              <div className="flex items-center text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Valid ST Certificate</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-primary text-lg">₹3,500/yr</span>
              <Link href="/applicant/apply" className="bg-teal-primary hover:bg-teal-600 text-white font-bold py-2 px-5 rounded-lg text-sm transition-colors shadow-md flex items-center">
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Match 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative opacity-75">
          <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            65% Match
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">PM-2022</span>
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Post Matric Scholarship</h2>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
              Scholarship for ST students pursuing higher education (Class XI and above).
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Income &lt; ₹2.5 Lakh/yr</div>
              <div className="flex items-center text-sm text-red-500 font-medium"><X className="w-4 h-4 text-red-500 mr-2" /> Requires Class XI+ Enrollment</div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="font-bold text-slate-400 text-lg">₹7,000/yr</span>
              <button disabled className="bg-slate-100 text-slate-400 font-bold py-2 px-5 rounded-lg text-sm cursor-not-allowed">
                Ineligible
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
