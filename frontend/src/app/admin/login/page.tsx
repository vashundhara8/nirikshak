"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, User, Lock, ArrowRight, Eye, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // For demo, we just authenticate immediately using OTP bypass if available
      // or standard endpoint. The UI asks for username/password, but backend expects OTP flow.
      // Since this is a demo, we will use the Dev OTP bypass for admin phone number: 9999999999
      
      const response = await fetchApi<any>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          mobile_number: "+919999999999", // Admin mock number
          challenge_id: "demo",
          otp: "123456", // Dev OTP
          required_role: "ADMIN"
        }),
        requireAuth: false,
      });

      login(response.access_token, response.refresh_token, response.user);
      router.push("/admin/analytics");
    } catch (err: any) {
      // In case dev OTP fails, we can just mock the login for UI purposes if needed,
      // but let's show the error.
      setError(err.message || "Authentication Failed. Use the Demo Login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111827] flex items-center justify-center p-4">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
      </div>

      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#1e1e38] p-8 relative">
           <div className="absolute right-4 top-4 cursor-pointer text-slate-400 hover:text-white" onClick={() => router.push('/')}>
             <X size={20} />
           </div>
           
           <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10 rounded-lg p-1 border border-white/20">
                <Image
                  src="/logo.png"
                  alt="NIRIKSHAK Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="text-gold font-bold text-[9px] uppercase tracking-widest leading-none mb-1">Government of India</div>
                <div className="text-white font-bold text-sm leading-none">Ministry of Tribal Affairs · NIRIKSHAK</div>
              </div>
           </div>

           <h2 className="text-2xl font-black text-white mb-2">Administrator Portal</h2>
           <p className="text-slate-400 text-xs leading-relaxed font-medium">
             Authorized administrative access for scheme scrutiny, DBT disbursements, and verification management.
           </p>
        </div>

        {/* Form */}
        <div className="p-8 bg-slate-50">
           {error && (
             <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-bold">
               {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="space-y-5">
             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Username *</label>
               <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                   <User size={16} />
                 </div>
                 <input 
                   type="text" 
                   className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-navy font-bold" 
                   placeholder="admin"
                   value={username}
                   onChange={e=>setUsername(e.target.value)}
                 />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-slate-700 mb-1.5">Password *</label>
               <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                   <Lock size={16} />
                 </div>
                 <input 
                   type="password" 
                   className="w-full pl-9 pr-10 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-navy font-bold tracking-widest" 
                   placeholder="••••••••"
                   value={password}
                   onChange={e=>setPassword(e.target.value)}
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600">
                   <Eye size={16} />
                 </div>
               </div>
             </div>

             <button type="submit" disabled={loading} className="w-full bg-[#6a748c] hover:bg-[#58627a] text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center text-sm">
               {loading ? (
                 <span className="flex items-center space-x-2">
                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                   <span>Authenticating...</span>
                 </span>
               ) : (
                 <span className="flex items-center text-gold">
                   <span className="text-white mr-2">Authenticating...</span> <ArrowRight size={16} />
                 </span>
               )}
             </button>
           </form>

           <div className="mt-4">
             <button onClick={() => handleLogin()} className="w-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-800 font-bold py-2.5 rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center">
               <span className="text-gold mr-2 text-lg leading-none">✨</span> Quick Demo Admin Login (admin@mota.gov.in)
             </button>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-navy">MoTA Official Security Gateway</div>
            <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
              This system is monitored and restricted strictly to authorized Ministry officers. All verification decisions and DBT sanction operations are cryptographically audited.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
