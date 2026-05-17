import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth/require-session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return <DashboardShell>{children}</DashboardShell>;
}
