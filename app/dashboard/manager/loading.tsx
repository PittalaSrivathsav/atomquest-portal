import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function ManagerLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Approvals"
        description="Review submitted employee goals and provide feedback."
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <div className="rounded-md border bg-card p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[150px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
