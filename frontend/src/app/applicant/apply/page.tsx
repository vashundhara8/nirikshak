"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, CheckCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

const SCHEME_OPTIONS = [
  { value: "PM-2022", label: "Post Matric Scholarship (PM-2022)" },
  { value: "NFST-2022", label: "National Fellowship for ST (NFST-2022)" },
  { value: "PRE-MATRIC-2022", label: "Pre Matric Scholarship (Pre-Matric-2022)" },
];

const ACADEMIC_YEAR_OPTIONS = ["2024-2025", "2023-2024", "2025-2026"];
const CATEGORY_OPTIONS = [
  { value: "ST", label: "Scheduled Tribe (ST)" },
  { value: "SC", label: "Scheduled Caste (SC)" },
];

export default function CreateApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appId, setAppId] = useState<string | null>(null);

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

  // Step 4: Documents (Uploaded via API)
  const [uploadedDocs, setUploadedDocs] = useState<{type: string, name: string}[]>([]);

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

      const response = await fetchApi<any>("/applications/", {
        method: "POST",
        body: JSON.stringify({ scheme_code: schemeCode, academic_year: academicYear, submitted_data }),
      });
      setAppId(response.application_id);
      setStep(4);
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
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  const submitFinal = () => {
    router.push(`/applicant/applications/${appId}`);
  };

  const inputCls = "w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 outline-none text-sm";
  const labelCls = "block text-xs font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/applicant/dashboard" className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium mb-6">
        <ArrowLeft size={16} /> <span>Back to Dashboard</span>
      </Link>

      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{error}</div>}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Personal & Demographic</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Scheme</label><select name="scheme_code" className={inputCls} value={schemeCode} onChange={e=>setSchemeCode(e.target.value)}>{SCHEME_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div><label className={labelCls}>Academic Year</label><select name="academic_year" className={inputCls} value={academicYear} onChange={e=>setAcademicYear(e.target.value)}>{ACADEMIC_YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              <div className="col-span-2"><label className={labelCls}>Full Name *</label><input name="full_name" type="text" className={inputCls} value={fullName} onChange={e=>setFullName(e.target.value)} /></div>
              <div><label className={labelCls}>Date of Birth *</label><input name="dob" type="date" className={inputCls} value={dob} onChange={e=>setDob(e.target.value)} /></div>
              <div><label className={labelCls}>Category *</label><select name="category" className={inputCls} value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className={labelCls}>Domicile State *</label><input name="domicile_state" type="text" className={inputCls} value={domicileState} onChange={e=>setDomicileState(e.target.value)} /></div>
              <div><label className={labelCls}>Aadhaar Last 4</label><input name="aadhaar" type="text" className={inputCls} value={maskedAadhaar} onChange={e=>setMaskedAadhaar(e.target.value)} maxLength={4} /></div>
            </div>
            <div className="flex justify-end pt-4"><button onClick={() => setStep(2)} className="bg-teal-700 text-white px-4 py-2 rounded flex items-center">Next <ArrowRight size={16} className="ml-2"/></button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Academic & Institution</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className={labelCls}>Institution Name *</label><input name="institution_name" type="text" className={inputCls} value={institutionName} onChange={e=>setInstitutionName(e.target.value)} /></div>
              <div><label className={labelCls}>Institution Code</label><input name="institution_id" type="text" className={inputCls} value={institutionId} onChange={e=>setInstitutionId(e.target.value)} /></div>
              <div className="col-span-2"><label className={labelCls}>Course Name *</label><input name="course_name" type="text" className={inputCls} value={courseName} onChange={e=>setCourseName(e.target.value)} /></div>
              <div><label className={labelCls}>Course Code</label><input name="course_id" type="text" className={inputCls} value={courseId} onChange={e=>setCourseId(e.target.value)} /></div>
              <div><label className={labelCls}>Last Exam %</label><input name="exam_percentage" type="number" className={inputCls} value={examPercentage} onChange={e=>setExamPercentage(e.target.value)} /></div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded">Back</button>
              <button onClick={() => setStep(3)} className="bg-teal-700 text-white px-4 py-2 rounded flex items-center">Next <ArrowRight size={16} className="ml-2"/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Income & Financial</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Annual Family Income (Rs.) *</label><input name="annual_family_income" type="number" className={inputCls} value={annualFamilyIncome} onChange={e=>setAnnualFamilyIncome(e.target.value)} /></div>
              <div><label className={labelCls}>Income Source</label><input name="income_source" type="text" className={inputCls} value={incomeSource} onChange={e=>setIncomeSource(e.target.value)} /></div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(2)} className="text-slate-600 px-4 py-2 hover:bg-slate-100 rounded">Back</button>
              <button onClick={handleCreateApplication} disabled={loading} className="bg-teal-700 text-white px-4 py-2 rounded flex items-center">
                {loading ? "Creating..." : "Create Application & Upload Docs"} <ArrowRight size={16} className="ml-2"/>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Upload Documents</h2>
            <p className="text-sm text-slate-500 mb-4">Please upload required documents (PDF/JPEG up to 10MB).</p>
            
            <div className="space-y-4">
              {['INCOME_CERTIFICATE', 'ST_CERTIFICATE'].map(docType => {
                const uploaded = uploadedDocs.find(d => d.type === docType);
                return (
                  <div key={docType} className="border border-slate-200 p-4 rounded bg-slate-50">
                    <h3 className="font-semibold text-sm mb-2">{docType.replace('_', ' ')}</h3>
                    {uploaded ? (
                      <div className="flex items-center text-green-700 text-sm"><CheckCircle size={16} className="mr-2"/> Uploaded: {uploaded.name}</div>
                    ) : (
                      <div className="relative border-2 border-dashed border-slate-300 rounded p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                        <input type="file" onChange={(e) => e.target.files && onDrop(Array.from(e.target.files), docType)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="application/pdf,image/jpeg,image/png"/>
                        <Upload className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                        <span className="text-xs text-teal-700">Click or drag file to upload</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={submitFinal} className="bg-teal-700 text-white px-4 py-2 rounded">Complete & Review</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
