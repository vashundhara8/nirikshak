"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create FormData as expected by OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetchApi<any>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
        requireAuth: false,
      });

      login(response.access_token, response.user);

      // Redirect based on role
      const roles = response.user.roles.map((r: any) => r.name);
      if (roles.includes("APPLICANT")) {
        router.push("/applicant/dashboard");
      } else {
        router.push("/officer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white shadow-sm border border-slate-300 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Nirikshak Platform</h1>
          <p className="text-sm text-slate-500 mt-2">
            MoTA Scholarship Intelligence & Lifecycle Platform
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-teal-700 focus:border-teal-700 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Need an account? <a href="/register" className="text-teal-700 font-medium hover:underline">Register here</a>
        </div>
      </div>
    </div>
  );
}
