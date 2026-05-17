import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function CheckInsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quarterly Check-ins"
        description="Track planned vs actual achievements."
      />

      <div className="flex justify-end">
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-[300px] w-full rounded-xl" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-5 w-16 mb-2" />
                  <Skeleton className="h-6 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
