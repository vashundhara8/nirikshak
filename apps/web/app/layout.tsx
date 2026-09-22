import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NIRIKSHAK • AI-powered Scholarship Verification & Lifecycle Platform",
  description:
    "Official scholarship verification, rule-governed lifecycle management, and human-in-the-loop decisioning platform for the Ministry of Tribal Affairs, Government of India. AI assists. Rules govern. Officers decide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
