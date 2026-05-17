import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AuditLogsView } from "@/components/admin/audit-logs-view";
import { getAuditLogs } from "@/actions/audit";

export const metadata: Metadata = {
  title: "Audit Logs | Admin",
  description: "View system audit trail and changes.",
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const filters = {
    userId: params.userId as string | undefined,
    action: params.action as string | undefined,
    entityType: params.entityType as string | undefined,
    date: params.date as string | undefined,
  };

  const result = await getAuditLogs(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit Logs"
        description="Track all changes, creations, and deletions across the platform."
      />

      {!result.success ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load audit logs.
        </div>
      ) : (
        <AuditLogsView
          data={JSON.parse(JSON.stringify(result.data))}
          initialFilters={filters}
        />
      )}
    </div>
  );
}
