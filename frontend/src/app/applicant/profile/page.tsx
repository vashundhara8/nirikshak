"use client";

import { useAuth } from "@/lib/auth";
import { User, Mail, Phone, MapPin, Building, GraduationCap, UploadCloud } from "lucide-react";

export default function MyProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-teal-primary h-full"></div>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex flex-shrink-0 items-center justify-center text-4xl font-bold text-navy relative group overflow-hidden">
             {user?.full_name?.charAt(0) || "A"}
             <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                <UploadCloud className="text-white w-6 h-6" />
             </div>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-1">{user?.full_name || "Applicant Name"}</h1>
            <p className="text-slate-500 font-medium">Nirikshak ID: <span className="text-navy font-bold">{user?.phone_number || "9876543210"}</span></p>
            <div className="flex items-center space-x-3 mt-3">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full border border-green-200">KYC Verified</span>
              <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full border border-teal-200">Aadhaar Seeded</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h2 className="text-lg font-bold text-navy mb-4 flex items-center"><User className="w-5 h-5 mr-2 text-teal-primary"/> Personal Information</h2>
           <div className="space-y-4">
             <div className="border-b border-slate-100 pb-3">
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Full Name</p>
               <p className="text-sm font-bold text-navy">{user?.full_name || "N/A"}</p>
             </div>
             <div className="border-b border-slate-100 pb-3">
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Date of Birth</p>
               <p className="text-sm font-bold text-navy">15 August 2005</p>
             </div>
             <div className="border-b border-slate-100 pb-3">
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Gender</p>
               <p className="text-sm font-bold text-navy">Female</p>
             </div>
             <div className="border-b border-slate-100 pb-3">
               <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Category / Tribe</p>
               <p className="text-sm font-bold text-navy">Scheduled Tribe (ST) - Santal</p>
             </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h2 className="text-lg font-bold text-navy mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-teal-primary"/> Contact Details</h2>
             <div className="space-y-4">
               <div>
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Phone Number</p>
                 <p className="text-sm font-bold text-navy flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-slate-400"/> +91 {user?.phone_number || "9876543210"}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Email Address</p>
                 <p className="text-sm font-bold text-navy flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-slate-400"/> {user?.full_name?.toLowerCase().replace(' ', '')}@example.com</p>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h2 className="text-lg font-bold text-navy mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-teal-primary"/> Academic Profile</h2>
             <div className="space-y-4">
               <div>
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Current Institution</p>
                 <p className="text-sm font-bold text-navy flex items-center"><Building className="w-3.5 h-3.5 mr-2 text-slate-400"/> Government Science College</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
