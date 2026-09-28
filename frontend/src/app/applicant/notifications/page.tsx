"use client";

import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex justify-between items-center">
        <div className="absolute top-0 left-0 w-1 bg-teal-primary h-full"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-2">Notifications</h1>
          <p className="text-slate-500 text-sm max-w-xl">
            Stay updated with alerts regarding your applications, document verifications, and MoTA announcements.
          </p>
        </div>
        <button className="text-sm font-bold text-teal-primary hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Unread Notification */}
        <div className="p-6 border-b border-slate-100 bg-blue-50/50 flex items-start space-x-4">
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
             <Info className="w-5 h-5 text-blue-600" />
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-start mb-1">
               <h3 className="font-bold text-navy text-base">New Scheme Recommended</h3>
               <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">New</span>
             </div>
             <p className="text-sm text-slate-600 mb-2">Based on your updated profile, you are now eligible for the Pre-Matric Scholarship Scheme for ST Students.</p>
             <span className="text-xs text-slate-400 font-medium">Just now</span>
           </div>
        </div>

        {/* Unread Action Required */}
        <div className="p-6 border-b border-slate-100 bg-orange-50/50 flex items-start space-x-4">
           <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
             <AlertTriangle className="w-5 h-5 text-orange-600" />
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-start mb-1">
               <h3 className="font-bold text-navy text-base">Action Required: Document Missing</h3>
               <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Urgent</span>
             </div>
             <p className="text-sm text-slate-600 mb-2">Your application for PM-2022 requires a valid Domicile Certificate. Please upload it before the deadline.</p>
             <button className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded shadow-sm transition-colors mb-2">Upload Now</button>
             <br />
             <span className="text-xs text-slate-400 font-medium">2 hours ago</span>
           </div>
        </div>

        {/* Read Notification */}
        <div className="p-6 flex items-start space-x-4 opacity-75 hover:opacity-100 transition-opacity">
           <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
             <CheckCircle className="w-5 h-5 text-green-600" />
           </div>
           <div className="flex-1">
             <div className="flex justify-between items-start mb-1">
               <h3 className="font-bold text-navy text-base">DigiLocker Sync Successful</h3>
             </div>
             <p className="text-sm text-slate-600 mb-2">Your Income Certificate and Caste Certificate were successfully synced and verified via DigiLocker.</p>
             <span className="text-xs text-slate-400 font-medium">Yesterday</span>
           </div>
        </div>
      </div>
    </div>
  );
}
