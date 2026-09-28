"use client";

import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AwardedScholarships() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-gold h-full"></div>
        <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-2">Awarded Scholarships</h1>
        <p className="text-slate-500 text-sm max-w-xl">
          View your successful scholarship awards, sanction orders, and Direct Benefit Transfer (DBT) history.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 text-center">
           <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-200">
             <Award className="h-8 w-8 text-gold" />
           </div>
           <h3 className="text-xl font-bold text-navy mb-2">No Awards Yet</h3>
           <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't been awarded any scholarships yet. Keep track of your ongoing applications to see when they get approved.</p>
           <Link href="/applicant/dashboard" className="inline-flex items-center bg-navy text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors hover:bg-navy-light">
             Track Applications <ArrowRight className="w-4 h-4 ml-2" />
           </Link>
        </div>
      </div>
    </div>
  );
}
