import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell role="public">
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
          Error 404 • Resource Not Located
        </div>
        <h1 className="text-2xl font-black text-[#0A192F]">
          Public Service Document / Page Not Found
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested page or record could not be found on the NIRIKSHAK portal. Please verify the URL or return to the main services directory.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0A192F] text-white text-xs font-bold rounded-[2px] hover:bg-[#1E3A5F]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal Home</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
