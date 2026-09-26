"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { FileText, PlusCircle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

type Application = {
  application_id: string;
  scheme_code: string;
  academic_year: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function ApplicantDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await fetchApi<Application[]>("/applications");
        setApplications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "DEFICIENCY_FOUND":
      case "REQUIRES_CORRECTION":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
      case "DEFICIENCY_FOUND":
      case "REQUIRES_CORRECTION":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <Link
          href="/applicant/apply"
          className="flex items-center space-x-2 px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors"
        >
          <PlusCircle size={20} />
          <span>New Application</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No applications found</h3>
          <p className="mt-1 text-slate-500">You haven't submitted any applications yet.</p>
          <div className="mt-6">
            <Link
              href="/applicant/apply"
              className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800 transition-colors"
            >
              Start an Application
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Link
              key={app.application_id}
              href={`/applicant/applications/${app.application_id}`}
              className="block bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="text-teal-700 h-5 w-5" />
                  <span className="font-semibold text-slate-900">{app.scheme_code}</span>
                </div>
                {getStatusIcon(app.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Year:</span>
                  <span className="font-medium text-slate-900">{app.academic_year}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submitted:</span>
                  <span className="text-slate-700">
                    {format(new Date(app.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
