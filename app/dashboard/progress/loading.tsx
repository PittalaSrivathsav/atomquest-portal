import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function ProgressLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Analytics"
        description="Track milestones and completion over time."
      />

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6"
          >
            <div className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6"
          >
            <div>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="flex h-[300px] items-center justify-center">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
