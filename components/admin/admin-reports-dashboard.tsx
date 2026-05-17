"use client";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import type { AdminReportData, AdminReportFilters } from "@/actions/admin";

export function AdminReportsDashboard({
  data,
  initialFilters,
}: {
  data: AdminReportData;
  initialFilters: AdminReportFilters;
}) {
  return <AdminDashboard data={data} initialFilters={initialFilters} />;
}
