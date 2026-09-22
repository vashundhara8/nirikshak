"use client";

import * as React from "react";
import { InstitutionalHeader } from "./institutional-header";
import { ServiceSidebar } from "./service-sidebar";
import { PortalFooter } from "./portal-footer";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  role?: "student" | "officer" | "public";
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: React.ReactNode;
  activeSidebarTab?: string;
  onSelectSidebarTab?: (tab: string) => void;
}

export function AppShell({
  children,
  role = "public",
  pageTitle,
  pageSubtitle,
  breadcrumbs,
  headerActions,
  activeSidebarTab,
  onSelectSidebarTab,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const hasSidebar = role === "student" || role === "officer";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      <InstitutionalHeader
        showSidebarToggle={hasSidebar}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex w-full">
        {hasSidebar && (
          <ServiceSidebar
            role={role}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeItem={activeSidebarTab}
            onSelectTab={onSelectSidebarTab}
          />
        )}

        <main
          className={cn(
            "flex-1 w-full min-w-0 flex flex-col",
            hasSidebar ? "lg:pl-60" : ""
          )}
        >
          {/* Breadcrumb & Title Area */}
          {(breadcrumbs || pageTitle || headerActions) && (
            <div className="border-b border-slate-300 bg-white px-4 sm:px-8 py-3">
              <div className="max-w-7xl mx-auto">
                {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-1" />}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    {pageTitle && (
                      <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A192F]">
                        {pageTitle}
                      </h1>
                    )}
                    {pageSubtitle && (
                      <p className="text-xs text-slate-500 font-medium">
                        {pageSubtitle}
                      </p>
                    )}
                  </div>
                  {headerActions && (
                    <div className="flex items-center gap-2 shrink-0">
                      {headerActions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 px-4 sm:px-8 py-5">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </div>

          <PortalFooter />
        </main>
      </div>
    </div>
  );
}
