import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function AuditLogsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit Logs"
        description="Track all changes, creations, and deletions across the platform."
      />

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
