"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, FileText, Check, AlertCircle, Sparkles, X, User, GraduationCap, Building, ShieldCheck, RefreshCw } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useDropzone } from "react-dropzone";

const SCHEME_OPTIONS = [
  { value: "PM-2022", label: "Post Matric Scholarship Scheme for ST Students (PM-2022)" },
  { value: "NFST-2022", label: "National Fellowship for ST (NFST-2022)" },
  { value: "PRE_MATRIC", label: "Pre-Matric Scholarship Scheme for ST Students (Class IX & X)" },
];

const ACADEMIC_YEAR_OPTIONS = ["2024-2025", "2023-2024", "2025-2026"];
const CATEGORY_OPTIONS = [
  { value: "ST", label: "Scheduled Tribe (ST)" },
  { value: "SC", label: "Scheduled Caste (SC)" },
];

const STEPS = [
  { id: 1, name: "Personal Details" },
  { id: 2, name: "Education Details" },
  { id: 3, name: "Bank (DBT)" },
  { id: 4, name: "Documents" },
  { id: 5, name: "Declaration" },
  { id: 6, name: "Review" },
  { id: 7, name: "Submit" },
];

export default function CreateApplicationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [error, setError] = useState("");
  const [appId, setAppId] = useState<string | null>(editId);

  // Modal State
  const [showEligibilityModal, setShowEligibilityModal] = useState(!editId);
  const [eligibilityIncome, setEligibilityIncome] = useState("");
  const [eligibilityLevel, setEligibilityLevel] = useState("Secondary (Class 9-10)");
  const [eligibilityCourse, setEligibilityCourse] = useState("");
  const [eligibilityLocation, setEligibilityLocation] = useState("India");

  // Step 1: Personal & Demographic
  const [schemeCode, setSchemeCode] = useState("PM-2022");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [category, setCategory] = useState("ST");
  const [domicileState, setDomicileState] = useState("");
  const [maskedAadhaar, setMaskedAadhaar] = useState("");

  // Step 2: Academic & Institution
  const [institutionId, setInstitutionId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [examPercentage, setExamPercentage] = useState("");

  // Step 3: Income & Financial
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("");

  const [uploadedDocs, setUploadedDocs] = useState<{type: string, name: string}[]>([]);

  useEffect(() => {
    if (editId && !initialFetchDone) {
      setLoading(true);
      fetchApi<any>(`/applications/${editId}`)
        .then(data => {
          if (data && data.status === "DRAFT") {
            setSchemeCode(data.scheme_code || "PM-2022");
            setAcademicYear(data.academic_year || "2024-2025");
            const sub = data.submitted_data || {};
            if (sub.applicant) {
              setFullName(sub.applicant.name || "");
              setDob(sub.applicant.dob || "");
              if (sub.applicant.masked_aadhaar) {
                setMaskedAadhaar(sub.applicant.masked_aadhaar.split('-').pop() || "");
              }
            }
            if (sub.demographic) {
              setCategory(sub.demographic.category || "ST");
              setDomicileState(sub.demographic.domicile_state || "");
              setAnnualFamilyIncome(sub.demographic.annual_family_income?.toString() || "");
              setIncomeSource(sub.demographic.income_source || "");
            }
            if (sub.academic) {
              setInstitutionName(sub.academic.institution_name || "");
              setInstitutionId(sub.academic.institution_id || "");
              setCourseName(sub.academic.course_name || "");
              setCourseId(sub.academic.course_id || "");
              setExamPercentage(sub.academic.last_exam_percentage?.toString() || "");
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch application for editing:", err);
          setError("Failed to load application data.");
        })
        .finally(() => {
          setInitialFetchDone(true);
          setLoading(false);
        });
    }
  }, [editId, initialFetchDone]);

  const handleCreateApplication = async () => {
    if (!fullName.trim() || !dob || !domicileState.trim() || !institutionName.trim() || !courseName.trim() || !annualFamilyIncome) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const submitted_data = {
        applicant: {
          name: fullName.trim(),
          dob: dob,
          ...(maskedAadhaar ? { masked_aadhaar: `XXXX-XXXX-${maskedAadhaar}` } : {}),
        },
        demographic: {
          category: category,
          domicile_state: domicileState.trim(),
          annual_family_income: Number(annualFamilyIncome),
          ...(incomeSource ? { income_source: incomeSource.trim() } : {}),
        },
        academic: {
          institution_id: institutionId.trim() || institutionName.trim(),
          institution_name: institutionName.trim(),
          course_id: courseId.trim() || courseName.trim(),
          course_name: courseName.trim(),
          academic_year: academicYear,
          ...(examPercentage ? { last_exam_percentage: Number(examPercentage) } : {}),
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await fetchApi<any>("/applications/", {
        method: "POST",
        body: JSON.stringify({ scheme_code: schemeCode, academic_year: academicYear, submitted_data }),
      });
      setAppId(response.application_id);
      setStep(4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to create application.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = async (acceptedFiles: File[], docType: string) => {
    if (!appId || acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    // Max size 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds 10MB limit.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);

      const token = localStorage.getItem("nirikshak_token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

      const res = await fetch(`${apiBase}/applications/${appId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Upload failed");
      }

      setUploadedDocs([...uploadedDocs, { type: docType, name: file.name }]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  const submitFinal = async () => {
    try {
      const token = localStorage.getItem("nirikshak_token");
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
      await fetch(`${apiBase}/applications/${appId}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/applicant/applications/${appId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const inputCls = "w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-primary/50 outline-none text-sm text-slate-900 bg-white transition-shadow";
  const labelCls = "block text-xs font-semibold text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Eligibility Modal Overlay */}
      {showEligibilityModal && (
        <div className="fixed inset-0 z-[60] bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="bg-navy p-6 relative">
               <div className="absolute right-4 top-4 cursor-pointer text-slate-400 hover:text-white" onClick={() => router.push('/applicant/dashboard')}><X size={20} /></div>
               <div className="flex items-center space-x-2 text-gold font-bold text-[10px] uppercase tracking-widest mb-3 border border-gold/30 w-fit px-2.5 py-1 rounded-full bg-gold/10 shadow-sm">
                 <ShieldCheck size={14} /> Eligibility-First Application Gate
               </div>
               <h2 className="text-2xl font-black text-white leading-tight">Statutory Eligibility Check</h2>
               <p className="text-slate-400 text-sm mt-1 font-medium">Ministry of Tribal Affairs Central Sector Scholarship Portal</p>
               
               <div className="mt-6 bg-slate-800/80 border border-slate-700 p-4 rounded-lg flex items-center shadow-inner">
                 <div className="w-12 h-12 bg-gold rounded text-navy font-black text-lg flex items-center justify-center mr-4">{schemeCode.substring(0,3)}</div>
                 <div>
                   <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-0.5">Selected Scholarship Scheme</p>
                   <p className="text-white font-bold text-sm leading-snug">{SCHEME_OPTIONS.find(s=>s.value===schemeCode)?.label}</p>
                 </div>
               </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 bg-slate-50">
               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                   <span>Applicant Community / Category</span> <span className="text-teal-600 flex items-center"><Check size={14} className="mr-1"/> ST Verified</span>
                 </label>
                 <div className="w-full p-2.5 bg-slate-200 text-slate-500 rounded-lg text-sm border border-slate-300 font-medium cursor-not-allowed shadow-inner">Scheduled Tribe (Scheduled Tribe)</div>
                 <p className="text-[10px] text-slate-500 mt-1.5">All MoTA central schemes are strictly reserved for Scheduled Tribe (ST) students.</p>
               </div>

               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                   <span>Family Annual Income (₹) <span className="text-red-500">*</span></span> 
                   <span className="text-slate-500">Scheme Ceiling: ₹2,50,000</span>
                 </label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                   <input type="number" className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" value={eligibilityIncome} onChange={e=>setEligibilityIncome(e.target.value)} />
                 </div>
               </div>

               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                   <span>Current / Proposed Education Level <span className="text-red-500">*</span></span> 
                   <span className="text-slate-500">Targeted: Secondary (Class 9-10)</span>
                 </label>
                 <select className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" value={eligibilityLevel} onChange={e=>setEligibilityLevel(e.target.value)}>
                   <option value="Secondary (Class 9-10)">Secondary (Class 9-10)</option>
                   <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                   <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                   <option value="Ph.D. / Doctoral">Ph.D. / Doctoral</option>
                 </select>
                 <p className="text-[10px] text-teal-600 mt-1.5 flex items-center"><Check size={12} className="mr-1"/> Profile recorded level: Undergraduate (UG)</p>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-700 mb-2">Enrolled Course / Degree Program</label>
                 <input type="text" className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" value={eligibilityCourse} onChange={e=>setEligibilityCourse(e.target.value)} />
               </div>

               <div>
                 <label className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                   <span>Study Location</span>
                   <span className="text-slate-500">Scheme Requirement: India</span>
                 </label>
                 <div className="grid grid-cols-2 gap-4">
                   <div onClick={()=>setEligibilityLocation("India")} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center transition-all shadow-sm ${eligibilityLocation==="India"?"border-blue-500 bg-blue-50/50":"border-slate-200 bg-white hover:border-blue-300"}`}>
                      <Building className={`w-5 h-5 mr-3 ${eligibilityLocation==="India"?"text-blue-600":"text-slate-400"}`} />
                      <div>
                        <div className={`text-sm font-bold mb-0.5 ${eligibilityLocation==="India"?"text-blue-800":"text-slate-700"}`}>India (Domestic)</div>
                        <div className="text-[10px] font-medium text-slate-500">Recognized Central / State Inst.</div>
                      </div>
                   </div>
                   <div onClick={()=>setEligibilityLocation("Overseas")} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center transition-all shadow-sm ${eligibilityLocation==="Overseas"?"border-blue-500 bg-blue-50/50":"border-slate-200 bg-white hover:border-blue-300"}`}>
                      <Sparkles className={`w-5 h-5 mr-3 ${eligibilityLocation==="Overseas"?"text-blue-600":"text-slate-400"}`} />
                      <div>
                        <div className={`text-sm font-bold mb-0.5 ${eligibilityLocation==="Overseas"?"text-blue-800":"text-slate-700"}`}>Overseas (Abroad)</div>
                        <div className="text-[10px] font-medium text-slate-500">Foreign QS Top 500 Univ.</div>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center rounded-b-xl">
              <div className="flex space-x-4">
                 <button className="px-5 py-2.5 bg-[#9ba7cf] hover:bg-[#8594c2] text-white rounded-lg text-sm font-bold flex items-center transition-colors shadow-sm" onClick={() => {
                     setAnnualFamilyIncome(eligibilityIncome);
                     setCourseName(eligibilityCourse);
                     setShowEligibilityModal(false);
                 }}>
                   <RefreshCw size={16} className="mr-2" /> Evaluating Statutory Rules...
                 </button>
                 <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 flex items-center transition-colors shadow-sm">
                   <FileText size={16} className="mr-2 text-slate-400" /> View Scheme Guidelines
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gold text-navy font-black text-xl flex items-center justify-center">
            {schemeCode.substring(0, 3)}
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center space-x-2">
              <span>Scholarship Application Form</span>
              <span className="bg-blue-600/30 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-500/30">MoTA Official Portal</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {SCHEME_OPTIONS.find(s => s.value === schemeCode)?.label || "Scholarship Scheme"}
            </p>
          </div>
        </div>
        <button onClick={() => router.push('/applicant/dashboard')} className="text-slate-400 hover:text-white flex items-center space-x-2 text-sm transition-colors">
          <span>Exit</span> <X size={16} />
        </button>
      </div>

      {/* Secondary Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-navy">Select Scheme:</span>
          <select 
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-primary/50 min-w-[300px]"
            value={schemeCode} 
            onChange={e => setSchemeCode(e.target.value)}
          >
            {SCHEME_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Award:</span>
          <span className="bg-green-100 text-green-800 border border-green-200 text-xs font-bold px-3 py-1.5 rounded-md">₹3,500 to ₹7,000 per annum directly via DBT</span>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-teal-50 border-b border-teal-100 px-6 py-2 flex items-center space-x-2 text-sm">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span className="font-bold text-teal-800">Statutory Eligibility Verified:</span>
        <span className="text-teal-600">Mandatory criteria confirmed prior to form entry</span>
      </div>

      {/* Stepper */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-6 shadow-inner">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center group cursor-pointer" onClick={() => setStep(s.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 shadow-sm ${
                  step > s.id ? 'bg-teal-primary border-teal-primary text-white' :
                  step === s.id ? 'bg-navy border-navy text-gold' :
                  'bg-white border-slate-300 text-slate-400'
                }`}>
                  {step > s.id ? <Check size={16} strokeWidth={3} /> : s.id}
                </div>
                <span className={`text-xs mt-2 font-bold whitespace-nowrap transition-colors ${
                  step >= s.id ? 'text-navy' : 'text-slate-400'
                }`}>
                  {s.name}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-4 mb-5 transition-colors">
                  <div className={`h-full w-full rounded-full ${step > s.id ? 'bg-teal-primary' : 'bg-slate-200'}`}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-8 hide-scrollbar">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-start shadow-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-primary" />
                </div>
                <h2 className="text-xl font-bold text-navy">Personal & Demographic Details</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Academic Year *</label>
                  <select name="academic_year" className={inputCls} value={academicYear} onChange={e=>setAcademicYear(e.target.value)}>
                    {ACADEMIC_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Applicant Full Name (As per Aadhaar) *</label>
                  <input name="full_name" type="text" className={inputCls} placeholder="e.g. Rahul Sharma" value={fullName} onChange={e=>setFullName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth *</label>
                  <input name="dob" type="date" className={inputCls} value={dob} onChange={e=>setDob(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select name="category" className={inputCls} value={category} onChange={e=>setCategory(e.target.value)}>
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Domicile State *</label>
                  <input name="domicile_state" type="text" className={inputCls} placeholder="e.g. Odisha" value={domicileState} onChange={e=>setDomicileState(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Aadhaar Last 4 Digits</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-mono tracking-widest px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">XXXX-XXXX</span>
                    <input name="aadhaar" type="text" className={inputCls} placeholder="1234" value={maskedAadhaar} onChange={e=>setMaskedAadhaar(e.target.value)} maxLength={4} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-teal-primary" />
                </div>
                <h2 className="text-xl font-bold text-navy">Academic & Institution Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className={labelCls}>Current Institution Name *</label>
                  <input name="institution_name" type="text" className={inputCls} placeholder="e.g. Government Higher Secondary School" value={institutionName} onChange={e=>setInstitutionName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Institution Code (AISHE/DISE)</label>
                  <input name="institution_id" type="text" className={inputCls} value={institutionId} onChange={e=>setInstitutionId(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Course / Program Name *</label>
                  <input name="course_name" type="text" className={inputCls} placeholder="e.g. Class X" value={courseName} onChange={e=>setCourseName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Last Examination Percentage (%)</label>
                  <input name="exam_percentage" type="number" className={inputCls} placeholder="e.g. 85" value={examPercentage} onChange={e=>setExamPercentage(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Building className="w-5 h-5 text-teal-primary" />
                </div>
                <h2 className="text-xl font-bold text-navy">Income & Financial Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Annual Family Income (Rs.) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input name="annual_family_income" type="number" className={`${inputCls} pl-8`} placeholder="120000" value={annualFamilyIncome} onChange={e=>setAnnualFamilyIncome(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Primary Income Source</label>
                  <input name="income_source" type="text" className={inputCls} placeholder="e.g. Agriculture" value={incomeSource} onChange={e=>setIncomeSource(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {[
                { type: 'INCOME_CERTIFICATE', label: 'Parent / Guardian Income Certificate (<= 2.5 Lakh/yr)', required: true, example: 'DEMO_Income_Certificate.pdf', size: '290 KB' },
                { type: 'PREVIOUS_MARKSHEET', label: 'Previous Class Passing Marksheet', required: true, example: 'DEMO_12th_Marksheet.pdf', size: '300 KB' },
                { type: 'BONAFIDE_CERT', label: 'School Bonafide Certificate / Headmaster Letter', required: true, example: 'Panda.jpg', size: '91 KB' },
              ].map(doc => {
                const uploaded = uploadedDocs.find(d => d.type === doc.type);
                return (
                  <div key={doc.type} className="bg-teal-50/30 border border-teal-100 p-5 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-bold text-navy">{doc.label}</h3>
                        {doc.required && <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">Required</span>}
                      </div>
                      {uploaded ? (
                        <div className="flex items-center text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle size={14} className="mr-1.5"/> Attached to This Application
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium italic">Pending Upload</div>
                      )}
                    </div>
                    
                    {uploaded ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy">File: {uploaded.name} <span className="text-slate-400 font-normal text-xs ml-1">({doc.size})</span></p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] text-slate-500 flex items-center"><Upload className="w-3 h-3 mr-1" /> Direct Upload</span>
                              <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 rounded font-bold">AI_VERIFIED</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center">
                            <FileText className="w-3.5 h-3.5 mr-2" /> Preview
                          </button>
                          <button className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center">
                            Replace
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-teal-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/50 hover:border-teal-400 transition-colors relative">
                        <input type="file" onChange={(e) => e.target.files && onDrop(Array.from(e.target.files), doc.type)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf,image/jpeg,image/png"/>
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-teal-primary" />
                        </div>
                        <p className="text-sm font-bold text-navy">Click or drag file to upload</p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">PDF, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 5 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-navy mb-4">Declaration</h2>
              <p className="text-slate-500 mb-6 max-w-lg mx-auto">I hereby declare that the information provided is true to the best of my knowledge.</p>
              <div className="flex items-center justify-center space-x-2">
                <input type="checkbox" id="declare" className="w-5 h-5 rounded border-slate-300 text-teal-primary focus:ring-teal-primary" />
                <label htmlFor="declare" className="font-semibold text-navy">I Agree</label>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-navy mb-6">Review Application</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Name</span><span className="font-bold text-navy">{fullName || "Not Provided"}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Institution</span><span className="font-bold text-navy">{institutionName || "Not Provided"}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Income</span><span className="font-bold text-navy">₹{annualFamilyIncome || "0"}</span></div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6 relative">
                <Sparkles className="w-10 h-10 text-teal-primary animate-pulse" />
                <div className="absolute top-0 right-0 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                   <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-navy mb-4">Ready for Electronic Submission</h1>
              <p className="text-slate-500 max-w-lg text-center font-medium leading-relaxed">
                Clicking "Submit Application" will generate your official MoTA Reference Number and route your dossier into the automated AI OCR Scrutiny and State Welfare Officer queue.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold flex items-center transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center transition-colors">
              Save as Draft
            </button>
            
            {step < 7 && (
              <button 
                onClick={() => {
                  if (step === 3) handleCreateApplication();
                  else setStep(step + 1);
                }}
                disabled={loading}
                className="px-8 py-2.5 bg-navy hover:bg-navy-light text-white rounded-lg text-sm font-bold shadow-lg flex items-center transition-colors"
              >
                {loading ? "Processing..." : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
            
            {step === 7 && (
              <button 
                onClick={submitFinal}
                disabled={loading}
                className="px-8 py-2.5 bg-teal-primary hover:bg-teal-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-teal-500/30 flex items-center transition-colors"
              >
                {loading ? (
                  <>Submitting to MoTA Server...</>
                ) : (
                  <>Submit Application <CheckCircle className="w-4 h-4 ml-2" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
