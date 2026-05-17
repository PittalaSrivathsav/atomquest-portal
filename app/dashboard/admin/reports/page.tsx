import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdminReportsDashboard } from "@/components/admin/admin-reports-dashboard";
import { getAdminReports } from "@/actions/admin";

export const metadata: Metadata = {
  title: "Admin Reports | AtomQuest Portal",
  description: "View organization-wide analytics and export reports.",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters = {
    quarter: params.quarter as string | undefined,
    year: params.year ? Number(params.year) : undefined,
    userId: params.userId as string | undefined,
    status: params.status as string | undefined,
    priority: params.priority as string | undefined,
  };

  const result = await getAdminReports(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Reports"
        description="View organization-wide analytics and export reports."
      />

      {!result.success ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load admin reports.
        </div>
      ) : (
        <AdminReportsDashboard
          data={JSON.parse(JSON.stringify(result.data))}
          initialFilters={filters}
        />
      )}
    </div>
  );
}
