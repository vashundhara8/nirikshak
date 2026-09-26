"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// These are the scheme codes that the backend policy engine recognises
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

export default function CreateApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Top-level
  const [schemeCode, setSchemeCode] = useState("PM-2022");
  const [academicYear, setAcademicYear] = useState("2024-2025");

  // Personal / demographic
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [category, setCategory] = useState("ST");
  const [domicileState, setDomicileState] = useState("");
  const [maskedAadhaar, setMaskedAadhaar] = useState("");

  // Financial
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("");

  // Academic
  const [institutionId, setInstitutionId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [examPercentage, setExamPercentage] = useState("");

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!dob) return "Date of birth is required.";
    if (!domicileState.trim()) return "Domicile state is required.";
    if (!annualFamilyIncome || isNaN(Number(annualFamilyIncome)) || Number(annualFamilyIncome) < 0)
      return "Annual family income must be a valid positive number.";
    if (!institutionName.trim()) return "Institution name is required.";
    if (!courseName.trim()) return "Course name is required.";
    if (maskedAadhaar && !/^\d{4}$/.test(maskedAadhaar))
      return "Aadhaar last 4 digits must be exactly 4 digits.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
        body: JSON.stringify({
          scheme_code: schemeCode,
          academic_year: academicYear,
          submitted_data,
        }),
      });

      router.push(`/applicant/applications/${response.application_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create application.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none bg-white text-slate-900";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/applicant/dashboard"
          className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Start New Application</h1>
        <p className="text-slate-500 text-sm mb-8">
          Fill in your details. All information will be verified against uploaded documents.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Scheme &amp; Year
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Scholarship Scheme</label>
                <select value={schemeCode} onChange={(e) => setSchemeCode(e.target.value)} className={inputCls} required>
                  {SCHEME_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Academic Year</label>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={inputCls} required>
                  {ACADEMIC_YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className={inputCls} placeholder="As it appears on official documents" required maxLength={255} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} required>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Domicile State <span className="text-red-500">*</span></label>
                <input type="text" value={domicileState} onChange={(e) => setDomicileState(e.target.value)}
                  className={inputCls} placeholder="e.g. Odisha" required maxLength={100} />
              </div>
              <div>
                <label className={labelCls}>Aadhaar Last 4 Digits (optional)</label>
                <input type="text" value={maskedAadhaar}
                  onChange={(e) => setMaskedAadhaar(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={inputCls} placeholder="e.g. 6789" maxLength={4} pattern="\d{4}" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Financial Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Annual Family Income (Rs.) <span className="text-red-500">*</span></label>
                <input type="number" value={annualFamilyIncome} onChange={(e) => setAnnualFamilyIncome(e.target.value)}
                  className={inputCls} placeholder="e.g. 250000" min={0} required />
              </div>
              <div>
                <label className={labelCls}>Income Source (optional)</label>
                <input type="text" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)}
                  className={inputCls} placeholder="e.g. Agriculture" maxLength={255} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Academic Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Institution Name <span className="text-red-500">*</span></label>
                <input type="text" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)}
                  className={inputCls} placeholder="Full name of college/university" required maxLength={255} />
              </div>
              <div>
                <label className={labelCls}>Institution ID / Code (if known)</label>
                <input type="text" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)}
                  className={inputCls} placeholder="e.g. AISHE-C-12345" maxLength={100} />
              </div>
              <div>
                <label className={labelCls}>Course Name <span className="text-red-500">*</span></label>
                <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)}
                  className={inputCls} placeholder="e.g. B.Tech Computer Science" required maxLength={255} />
              </div>
              <div>
                <label className={labelCls}>Course Code (if known)</label>
                <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)}
                  className={inputCls} placeholder="e.g. BTECH-CS" maxLength={100} />
              </div>
              <div>
                <label className={labelCls}>Last Exam Percentage (optional)</label>
                <input type="number" value={examPercentage} onChange={(e) => setExamPercentage(e.target.value)}
                  className={inputCls} placeholder="e.g. 72.5" min={0} max={100} step={0.01} />
              </div>
            </div>
          </section>

          <div className="pt-2">
            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded transition-colors disabled:opacity-50">
              {loading ? "Creating Application..." : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
