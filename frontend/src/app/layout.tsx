import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

import { I18nProvider } from "@/lib/i18n";

import { ScholarBot } from "@/components/ui/ScholarBot";

export const metadata: Metadata = {
  title: "Nirikshak Platform",
  description: "MoTA Scholarship Intelligence & Lifecycle Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-base-bg text-text-primary`}>
        <I18nProvider>
          <AuthProvider>
            {children}
            <ScholarBot />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
