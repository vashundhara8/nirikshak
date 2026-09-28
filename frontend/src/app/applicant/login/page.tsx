"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const isDev = process.env.NEXT_PUBLIC_APP_ENV !== "production";
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalMobile = mobileNumber.trim();
      if (!finalMobile.startsWith("+91")) {
        finalMobile = "+91" + finalMobile;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await fetchApi<any>("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ mobile_number: finalMobile }),
        requireAuth: false,
      });

      setChallengeId(response.challenge_id);
      setStep(2);
      setCountdown(30);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let finalMobile = mobileNumber.trim();
      if (!finalMobile.startsWith("+91")) {
        finalMobile = "+91" + finalMobile;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await fetchApi<any>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          mobile_number: finalMobile,
          challenge_id: challengeId,
          otp: otp,
          required_role: "APPLICANT"
        }),
        requireAuth: false,
      });

      login(response.access_token, response.refresh_token, response.user);
      router.push("/applicant/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const maskNumber = (num: string) => {
    const n = num.startsWith("+91") ? num.substring(3) : num;
    if (n.length !== 10) return num;
    return `+91 ${n.substring(0, 3)}XXXX${n.substring(7)}`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-base-bg text-text-primary selection:bg-teal-primary selection:text-white">
      <SiteHeader />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-teal-primary">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-teal-light rounded-full flex items-center justify-center mb-4">
               <ShieldCheck className="w-6 h-6 text-teal-primary" />
            </div>
            <CardTitle className="text-2xl">Applicant Login</CardTitle>
            <p className="text-sm text-text-muted mt-2">
              Access the Applicant Portal
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-status-error text-sm rounded border border-red-200">
                {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
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
                      className="flex-1 w-full p-2.5 border border-base-border rounded-r focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-shadow bg-white text-slate-900"
                      placeholder="Enter 10-digit mobile number"
                      required
                      pattern="[0-9]{10}"
                      maxLength={10}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || mobileNumber.replace("+91", "").length !== 10}
                  className="w-full font-bold tracking-wide mt-2"
                  size="lg"
                >
                  {loading ? "Requesting..." : "Send OTP"}
                </Button>
                
                <div className="mt-8 pt-6 border-t border-base-border text-center text-sm text-text-muted">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  Don't have an account? <Link href="/applicant/register" className="text-teal-primary font-bold hover:underline">Register here</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-4">
                  {isDev ? (
                    <div className="p-3 mb-3 bg-amber-50 border border-amber-300 rounded text-amber-800 text-xs text-left">
                      <strong>⚠️ Development Mode:</strong> No SMS was sent. Check the backend console for the OTP value printed by the dev adapter.
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-text-muted">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        We've sent a 6-digit OTP to
                      </p>
                      <p className="font-semibold text-lg text-teal-primary">
                        {maskNumber(mobileNumber)}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5 text-center">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="w-full p-2.5 border border-base-border rounded focus:ring-2 focus:ring-teal-primary focus:border-teal-primary outline-none transition-shadow bg-white text-slate-900 text-center tracking-widest text-2xl font-mono"
                    placeholder="------"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full font-bold tracking-wide mt-2"
                  size="lg"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <div className="flex flex-col items-center justify-center space-y-3 mt-4">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={countdown > 0 || loading}
                    className="text-sm font-medium text-teal-primary hover:underline disabled:text-gray-400 disabled:no-underline flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1.5" />
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-medium text-text-muted hover:text-text-primary flex items-center"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Change Mobile Number
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
