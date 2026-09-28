"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { format } from "date-fns";
import { FileText, PlusCircle, AlertCircle, CheckCircle, Clock, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
      case "DEFICIENCY_FOUND":
        return "error";
      case "REQUIRES_CORRECTION":
        return "warning";
      default:
        return "info";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-status-success" />;
      case "REJECTED":
      case "DEFICIENCY_FOUND":
      case "REQUIRES_CORRECTION":
        return <AlertCircle className="w-5 h-5 text-status-error" />;
      default:
        return <Clock className="w-5 h-5 text-teal-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[linear-gradient(135deg,#041e42_0%,#0f4c75_100%)] relative overflow-hidden rounded-2xl shadow-xl flex justify-between items-center p-8 mb-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent"></div>
        <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-tight mb-2">My Applications</h1>
           <p className="text-slate-300 text-sm font-medium">Manage and track your MoTA scholarship applications.</p>
        </div>
        <Button href="/applicant/apply" className="relative z-10 bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 px-6 shadow-[0_0_15px_rgba(20,184,166,0.3)] border-none">
          <PlusCircle size={18} className="mr-2" />
          New Application
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-status-error font-medium rounded border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-text-muted font-medium">Loading your secure dashboard...</div>
      ) : applications.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 md:col-span-2 border-dashed border-2 border-slate-300 bg-slate-50 overflow-hidden">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-5 border border-slate-200">
                <FileText className="h-8 w-8 text-teal-primary" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-2">Welcome to NIRIKSHAK</h3>
              <p className="text-slate-600 max-w-lg mb-8 font-medium">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You haven't submitted any scholarship applications yet. NIRIKSHAK makes it easy to discover eligible schemes, apply securely, and track your verification progress in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button href="/applicant/apply" className="flex-1 font-bold shadow-md">
                  Start New Application
                </Button>
                <Button href="/schemes" variant="outline" className="flex-1 font-bold bg-white">
                  Explore Scholarships
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-base-border">
            <CardHeader className="bg-slate-50 border-b border-base-border py-4">
              <CardTitle className="text-base flex items-center text-navy"><CheckCircle size={18} className="mr-2 text-teal-primary"/> Application Checklist</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-slate-600 font-medium">Before you apply, ensure you have the following documents ready in PDF format:</p>
              <ul className="text-sm space-y-3 font-medium text-navy">
                <li className="flex items-start"><div className="mr-3 mt-0.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div> Valid Income Certificate</li>
                <li className="flex items-start"><div className="mr-3 mt-0.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div> Caste / Tribe Certificate</li>
                <li className="flex items-start"><div className="mr-3 mt-0.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div> Domicile Certificate</li>
                <li className="flex items-start"><div className="mr-3 mt-0.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"></div> Previous Year Marksheet</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-base-border">
            <CardHeader className="bg-slate-50 border-b border-base-border py-4">
              <CardTitle className="text-base flex items-center text-navy"><Info size={18} className="mr-2 text-teal-primary"/> Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <Link href="/about" className="flex items-start group">
                <div className="w-8 h-8 rounded bg-teal-50 text-teal-primary flex items-center justify-center mr-3 group-hover:bg-teal-primary group-hover:text-white transition-colors">
                   <Clock size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy group-hover:text-teal-primary transition-colors">How the Process Works</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Learn about our AI-assisted verification.</p>
                </div>
              </Link>
              <Link href="/contact" className="flex items-start group">
                <div className="w-8 h-8 rounded bg-teal-50 text-teal-primary flex items-center justify-center mr-3 group-hover:bg-teal-primary group-hover:text-white transition-colors">
                   <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy group-hover:text-teal-primary transition-colors">Grievance & Support</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Contact the district nodal officer for help.</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <Link
              key={app.application_id}
              href={`/applicant/applications/${app.application_id}`}
              className="block group"
            >
              <Card className="hover:shadow-lg transition-all flex flex-col h-full overflow-hidden group border-0 ring-1 ring-slate-200">
                <div className="h-2 bg-teal-primary group-hover:bg-gold transition-colors"></div>
                <CardContent className="flex-1 flex flex-col p-6 bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                         <FileText className="text-teal-600 h-5 w-5" />
                      </div>
                      <span className="font-bold text-navy text-lg leading-tight">{app.scheme_code}</span>
                    </div>
                    {getStatusIcon(app.status)}
                  </div>
                  
                  <div className="bg-slate-50 rounded p-4 mb-4 text-sm border border-slate-200 space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Academic Year:</span>
                      <span className="font-bold text-navy">{app.academic_year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Submitted:</span>
                      <span className="font-bold text-navy">{format(new Date(app.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium text-sm">Status:</span>
                      <Badge variant={getStatusVariant(app.status)} className="font-bold px-3 py-1 text-[10px] tracking-wider uppercase">
                        {app.status.replace(/_/g, " ")}
                      </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
