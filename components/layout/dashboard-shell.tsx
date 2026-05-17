"use client";

import Image from "next/image";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { CommandPalette } from "@/components/command-palette";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <CommandPalette />
      {/* ── Background Fan for Dashboard ──────────────────────────── */}
      <div
        className="pointer-events-none fixed right-0 top-1/2 z-0 -translate-y-1/2 select-none opacity-20 lg:opacity-40"
        style={{
          width: "clamp(400px, 58vw, 900px)",
          aspectRatio: "1",
          transform: "translateX(18%) translateY(-50%)",
        }}
      >
        <div className="absolute inset-0">
          <Image
            src="/fan-hq.png"
            alt="Ceiling fan"
            fill
            className="object-contain"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-row">
        <DashboardSidebar />
        <SidebarInset className="flex flex-1 min-h-svh flex-col bg-transparent">
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 md:p-6 lg:p-8 relative z-10">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
