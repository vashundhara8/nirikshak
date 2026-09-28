"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, FileText, CheckCircle, ShieldCheck, Clock, Check, GraduationCap, AlertCircle } from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base-bg text-text-primary selection:bg-teal-primary selection:text-white">
      <SiteHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent"></div>
          
          <div className="max-w-[1400px] mx-auto px-6 py-16 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="bg-teal-400 hover:bg-teal-500 text-navy font-bold px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase border-none shadow-sm">
                  GLOBAL MASTERS & PH.D. IN STEM, MEDICINE & HUMANITIES
                </Badge>
                <Badge className="bg-slate-800/80 text-gold border border-gold/30 hover:bg-slate-800 font-bold px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase shadow-sm flex items-center">
                  <Check className="w-3 h-3 mr-1" /> AI-Assisted Verification & Scoring
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] mb-4 tracking-tight">
                National Overseas Scholarship for ST Candidates (NOS)
              </h1>
              <p className="text-lg text-slate-300 mb-8 font-medium">
                Study at Top 500 QS-Ranked Global Universities with 100% Funding
              </p>
              
              {/* Financial Assistance Box */}
              <div className="bg-navy/40 border border-slate-700 rounded-xl p-5 mb-8 inline-flex items-center backdrop-blur-sm max-w-2xl w-full">
                <div className="w-10 h-10 rounded bg-gold text-navy font-bold text-xl flex items-center justify-center mr-4 flex-shrink-0">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Financial Assistance</p>
                  <p className="text-gold font-bold text-lg md:text-xl leading-tight">100% Tuition Fees + USD/GBP 15,400 Living Grant + Airfare</p>
                </div>
              </div>

              {/* Perks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 max-w-2xl">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 font-medium">Complete overseas university tuition fee coverage</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 font-medium">Annual living maintenance grant of USD 15,400 / GBP 9,900</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 font-medium">Return economy international airfare</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 font-medium">Pre-departure orientation & automated visa clearances</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Key Scheme Dates Card */}
            <div className="lg:col-span-4">
               <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                 <div className="flex justify-between items-center border-b border-slate-700/50 pb-4 mb-5">
                   <h3 className="text-white font-bold flex items-center">
                     <Clock className="w-4 h-4 text-gold mr-2" /> Key Scheme Dates
                   </h3>
                   <span className="bg-teal-900 text-teal-300 border border-teal-700/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                     OPEN FOR 2026-27
                   </span>
                 </div>
                 
                 <div className="space-y-4 mb-6">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400 flex items-center"><Clock className="w-3.5 h-3.5 mr-2" /> Application Deadline:</span>
                     <span className="text-gold font-bold">15 November 2026</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Mode of Selection:</span>
                     <span className="text-white font-medium">National Merit + Scrutiny</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Disbursement:</span>
                     <span className="text-white font-medium">Direct Benefit Transfer (DBT)</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">AI Validation Time:</span>
                     <span className="text-teal-400 font-bold">&lt; 5 Minutes</span>
                   </div>
                 </div>

                 <div className="bg-navy/50 border border-slate-700/50 p-4 rounded-xl flex items-start text-xs text-slate-400 leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-gold mr-2 flex-shrink-0 mt-0.5" />
                    <span><strong className="text-slate-300">Note:</strong> Only registered Scheduled Tribe students with validated ST caste certificates from competent revenue officers are eligible.</span>
                 </div>
                 
                 <div className="mt-6 flex justify-end">
                    <Button variant="primary" href="/applicant/login" className="w-full justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                      Start Application
                    </Button>
                 </div>
               </div>
            </div>

          </div>
        </section>

        {/* Status Tracker Banner */}
        <section className="bg-teal-50 border-b border-teal-100 py-6 px-4 sm:px-6 lg:px-8">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <CheckCircle className="text-teal-700 w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-navy leading-none">Instant Application Tracking</h3>
                    <p className="text-sm text-teal-800 mt-1 font-medium">Check the live status of your verification and DBT.</p>
                 </div>
              </div>
              <div className="flex-1 max-w-xl flex items-center gap-2 w-full bg-white p-2 rounded shadow-sm border border-slate-200">
                 <input type="text" placeholder="Enter Application ID or Aadhaar Number" className="flex-1 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-primary focus:outline-none border-none bg-transparent" />
                 <Button variant="primary" className="h-10 px-6 font-bold shadow-none">Check Status</Button>
              </div>
           </div>
        </section>

        {/* How It Works & Eligibility */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* How to Apply */}
              <div>
                <div className="text-sm font-bold text-teal-primary uppercase tracking-widest mb-3">{t('how.service_clarity')}</div>
                <h2 className="text-3xl font-bold text-navy mb-8 font-serif">{t('how.title')}</h2>
                
                <div className="space-y-8">
                  {[
                    { title: t('how.step1.title'), desc: t('how.step1.desc') },
                    { title: t('how.step2.title'), desc: t('how.step2.desc') },
                    { title: t('how.step3.title'), desc: t('how.step3.desc') },
                    { title: t('how.step4.title'), desc: t('how.step4.desc') }
                  ].map((step, idx) => (
                    <div key={idx} className="flex">
                      <div className="flex flex-col items-center mr-6">
                        <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg shadow-md z-10 relative">
                          {idx + 1}
                        </div>
                        {idx !== 3 && <div className="w-0.5 h-full bg-slate-200 -mt-2"></div>}
                      </div>
                      <div className="pb-8">
                        <h3 className="text-xl font-bold text-navy mb-2">{step.title}</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mandatory Documents */}
              <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-navy mb-2 font-serif flex items-center"><ShieldCheck className="mr-3 text-gold" size={28} /> {t('docs.title')}</h2>
                <p className="text-slate-600 mb-8 font-medium">{t('docs.desc')}</p>
                
                <ul className="space-y-4">
                  {[
                    t('docs.doc1'),
                    t('docs.doc2'),
                    t('docs.doc3'),
                    t('docs.doc4'),
                    t('docs.doc5'),
                    t('docs.doc6')
                  ].map((doc, idx) => (
                    <li key={idx} className="flex items-start bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-4 mt-0.5 flex-shrink-0" />
                      <span className="font-bold text-navy text-sm">{doc}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded text-sm text-teal-900 font-medium">
                  <strong>{t('docs.note_label')}</strong> {t('docs.note_text')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Schemes */}
        <section className="py-20 bg-slate-100 border-t border-slate-200" id="schemes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-navy mb-4 font-serif">{t('schemes.featured')}</h2>
              <p className="text-slate-600 max-w-2xl mx-auto font-medium">Central and state-level financial assistance programs administered through the NIRIKSHAK platform.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: t('scheme.nfst.title'), 
                  desc: t('scheme.nfst.desc'), 
                  badge: "Higher Research",
                  amount: "₹31,000 - ₹35,000 / mo",
                  tenure: "Up to 5 Years"
                },
                { 
                  title: t('scheme.nos.title'), 
                  desc: t('scheme.nos.desc'), 
                  badge: "Study Abroad",
                  amount: "Full Tuition + Airfare",
                  tenure: "Up to 4 Years (Ph.D)"
                },
                { 
                  title: t('scheme.pm.title'), 
                  desc: t('scheme.pm.desc'), 
                  badge: "State + Central",
                  amount: "Maint. & Day Scholar Rates",
                  tenure: "Course Duration"
                }
              ].map((scheme, i) => (
                <Card key={i} className="hover:shadow-lg transition-all flex flex-col h-full overflow-hidden group border-0 ring-1 ring-slate-200">
                  <div className="h-2 bg-teal-primary group-hover:bg-gold transition-colors"></div>
                  <CardContent className="flex-1 flex flex-col p-8 bg-white">
                    <Badge variant="default" className="w-fit mb-4 text-[10px] uppercase tracking-wider border-none bg-slate-100 text-slate-600">{scheme.badge}</Badge>
                    <h3 className="text-xl font-bold text-navy mb-3 leading-tight">{scheme.title}</h3>
                    <p className="text-slate-600 text-sm mb-6 flex-1 leading-relaxed">{scheme.desc}</p>
                    
                    <div className="bg-slate-50 rounded p-4 mb-6 text-sm border border-slate-200">
                       <div className="flex justify-between mb-2">
                          <span className="text-slate-500 font-medium">Financial Aid:</span>
                          <span className="font-bold text-teal-800">{scheme.amount}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Duration:</span>
                          <span className="font-bold text-navy">{scheme.tenure}</span>
                       </div>
                    </div>

                    <Button variant="outline" size="sm" href="/applicant/login" className="w-full font-bold">Apply for Scheme</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
