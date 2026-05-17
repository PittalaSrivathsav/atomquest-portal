import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { getManagerGoals, getManagerCheckIns } from "@/actions/manager";
import { ManagerDashboard } from "@/components/manager/manager-dashboard";

export const metadata: Metadata = {
  title: "Manager Approval | AtomQuest Portal",
  description: "Review and approve employee goals and check-ins.",
};

export default async function ManagerPage() {
  const [goalsResult, checkInsResult] = await Promise.all([
    getManagerGoals(),
    getManagerCheckIns(),
  ]);

  const goals = goalsResult.success ? goalsResult.data : [];
  const checkIns = checkInsResult.success ? checkInsResult.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Approvals"
        description="Review submitted employee goals and quarterly check-ins."
      />

      {(!goalsResult.success || !checkInsResult.success) && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Some data failed to load. Please refresh the page.
        </div>
      )}

      {goalsResult.success && <ManagerDashboard initialGoals={goals} initialCheckIns={checkIns} />}
    </div>
  );
}
