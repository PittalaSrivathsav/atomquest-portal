import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Reports & Exports"
        description="Comprehensive team performance and achievement tracking."
      />

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Filters Skeleton */}
        <div className="rounded-xl border bg-card p-4 h-fit space-y-4">
          <Skeleton className="h-6 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-full mt-6" />
        </div>

        {/* Table/Chart Skeleton */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6 h-[300px]">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-full w-full" />
          </div>
          
          <div className="rounded-xl border bg-card p-6 h-[400px]">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
