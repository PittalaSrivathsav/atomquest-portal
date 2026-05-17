import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminReports } from "@/actions/admin";

export const metadata: Metadata = {
  title: "Admin Reports | AtomQuest Portal",
  description: "Enterprise goals and achievements reporting.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  const filters = {
    quarter: params.quarter as string | undefined,
    year: params.year ? Number(params.year) : new Date().getFullYear(),
    userId: params.userId as string | undefined,
    status: params.status as string | undefined,
    priority: params.priority as string | undefined,
  };

  const reportResult = await getAdminReports(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Reports & Exports"
        description="Comprehensive team performance and achievement tracking."
      />

      {!reportResult.success ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load reports data. Please ensure you have admin access.
        </div>
      ) : (
        <AdminDashboard 
          data={reportResult.data} 
          initialFilters={filters}
        />
      )}
    </div>
  );
}
