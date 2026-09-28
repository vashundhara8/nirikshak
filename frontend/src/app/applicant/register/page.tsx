"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let finalMobile = mobileNumber.trim();
      if (!finalMobile.startsWith("+91")) {
        finalMobile = "+91" + finalMobile;
      }
      
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          mobile_number: finalMobile,
          full_name: fullName,
        }),
        requireAuth: false,
      });

      setSuccess("Registration successful! You can now sign in.");
      setTimeout(() => {
        router.push("/applicant/login");
      }, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-bg font-sans p-4">
      <Card className="max-w-md w-full shadow-lg border-t-4 border-t-gold">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-navy tracking-tight">Create an Account</CardTitle>
          <p className="text-sm text-text-muted mt-2 font-medium">
            Register as an applicant to apply for scholarships.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-status-error text-sm rounded border border-red-200 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-status-success text-sm rounded border border-green-200 font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 border border-base-border rounded focus:ring-2 focus:ring-teal-primary outline-none text-slate-900 bg-white transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-base-border bg-gray-50 text-gray-500 sm:text-sm font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileNumber.replace("+91", "")}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  className="flex-1 w-full p-2.5 border border-base-border rounded-r focus:ring-2 focus:ring-teal-primary outline-none text-slate-900 bg-white transition-shadow"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !!success || mobileNumber.replace("+91", "").length !== 10}
              variant="primary"
              className="w-full py-6 text-base"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted font-medium">
            Already have an account? <Link href="/applicant/login" className="text-teal-primary hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
