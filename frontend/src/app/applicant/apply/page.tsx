"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateApplicationPage() {
  const [schemeCode, setSchemeCode] = useState("NFST"); // Default
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetchApi<any>("/applications/", {
        method: "POST",
        body: JSON.stringify({
          scheme_code: schemeCode,
          academic_year: academicYear,
          submitted_data: {}, // Starting empty, docs will provide data
        }),
      });

      router.push(`/applicant/applications/${response.application_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/applicant/dashboard" className="text-teal-700 hover:underline flex items-center space-x-1 text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Start New Application</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Scheme
            </label>
            <select
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none bg-white"
              required
            >
              <option value="NFST">National Fellowship for Scheduled Tribe (NFST)</option>
              <option value="POST-MATRIC">Post Matric Scholarship</option>
              <option value="PRE-MATRIC">Pre Matric Scholarship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none bg-white"
              required
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
