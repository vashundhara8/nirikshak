"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowRight, FileText, CheckCircle, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base-bg text-text-primary selection:bg-teal-primary selection:text-white">
      <SiteHeader />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-navy relative overflow-hidden border-b-[6px] border-gold">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
            <div className="max-w-4xl">
              <Badge variant="info" className="mb-6 border-none bg-teal-primary/20 text-teal-100 px-4 py-1.5 uppercase tracking-widest text-xs font-bold">
                Government of India • Ministry of Tribal Affairs
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight font-serif">
                {t('hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl leading-relaxed font-medium">
                A unified, AI-assisted verification platform for seamless and transparent scholarship disbursement. Secure, verifiable, and designed to ensure eligible students receive timely support.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" variant="secondary" href="/applicant/login" className="font-bold tracking-wide text-navy text-base h-14 px-8 shadow-xl hover:shadow-2xl transition-all">
                  Apply for Scholarship
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" href="/applicant/login" className="font-bold text-white border-white hover:bg-white/10 hover:text-white h-14 px-8">
                  Track Application Status
                </Button>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-1">₹840+ Cr</div>
                <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">DBT Disbursed (FY 24-25)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">2.4M+</div>
                <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Students Benefited</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Paperless Verification</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">14 Days</div>
                <div className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Avg Processing Time</div>
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
                <div className="text-sm font-bold text-teal-primary uppercase tracking-widest mb-3">Service Clarity</div>
                <h2 className="text-3xl font-bold text-navy mb-8 font-serif">How to Apply</h2>
                
                <div className="space-y-8">
                  {[
                    { title: "Register & Profile Setup", desc: "Create your account using your Mobile Number or Aadhaar. Fill in your basic demographic details." },
                    { title: "Choose Scheme & Upload", desc: "Select the appropriate scholarship scheme and upload digitally verifiable documents (PDFs)." },
                    { title: "Automated Verification", desc: "The NIRIKSHAK engine automatically verifies your document integrity and extracts data instantly." },
                    { title: "Officer Review & DBT", desc: "A Nodal Officer performs final scrutiny. Once approved, funds are transferred via Direct Benefit Transfer." }
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
                <h2 className="text-2xl font-bold text-navy mb-2 font-serif flex items-center"><ShieldCheck className="mr-3 text-gold" size={28} /> Required Documents</h2>
                <p className="text-slate-600 mb-8 font-medium">Please keep clear, legible PDF copies of the following documents ready before starting your application.</p>
                
                <ul className="space-y-4">
                  {[
                    "Caste / Tribe Certificate (Issued by competent authority)",
                    "Valid Income Certificate (Current financial year)",
                    "Domicile / Resident Certificate",
                    "Aadhaar Card (For identity & DBT linkage)",
                    "Previous Year Academic Marksheet",
                    "Institution Admission Proof / Fee Receipt"
                  ].map((doc, idx) => (
                    <li key={idx} className="flex items-start bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-4 mt-0.5 flex-shrink-0" />
                      <span className="font-bold text-navy text-sm">{doc}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 p-4 bg-teal-50 border border-teal-100 rounded text-sm text-teal-900 font-medium">
                  <strong>Note:</strong> Uploaded documents must be authentic. Forgery will lead to immediate rejection and legal action under Government of India guidelines.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Schemes */}
        <section className="py-20 bg-slate-100 border-t border-slate-200" id="schemes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-navy mb-4 font-serif">Flagship Scholarship Schemes</h2>
              <p className="text-slate-600 max-w-2xl mx-auto font-medium">Central and state-level financial assistance programs administered through the NIRIKSHAK platform.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "National Fellowship for ST", 
                  desc: "Comprehensive financial support to pursue M.Phil & Ph.D. degrees in Sciences, Humanities, Engineering, and Technology at top Indian universities.", 
                  badge: "Higher Research",
                  amount: "₹31,000 - ₹35,000 / mo",
                  tenure: "Up to 5 Years"
                },
                { 
                  title: "National Overseas Scholarship", 
                  desc: "Global postgraduate and doctoral funding for ST candidates admitted into top 500 QS World Ranked international academic institutions.", 
                  badge: "Study Abroad",
                  amount: "Full Tuition + Airfare",
                  tenure: "Up to 4 Years (Ph.D)"
                },
                { 
                  title: "Post-Matric Scholarship for ST", 
                  desc: "Financial aid for meritorious tribal students pursuing recognized post-secondary courses across colleges, polytechnics, and vocational centers.", 
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
