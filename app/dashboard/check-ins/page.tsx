import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { getMyCheckIns } from "@/actions/check-ins";
import { getGoals } from "@/actions/goals";
import { CheckInsDashboard } from "@/components/check-ins/check-ins-dashboard";

export const metadata: Metadata = {
  title: "Quarterly Check-ins | AtomQuest Portal",
  description: "Track planned vs actual achievements per quarter.",
};

export default async function CheckInsPage() {
  const currentYear = new Date().getFullYear();
  const [goalsResult, checkInsResult] = await Promise.all([
    getGoals(),
    getMyCheckIns(currentYear),
  ]);

  const goals = goalsResult.success ? goalsResult.data : [];
  const checkIns = checkInsResult.success ? checkInsResult.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quarterly Check-ins"
        description={`Track planned vs actual achievements for ${currentYear}.`}
      />

      {(!goalsResult.success || !checkInsResult.success) && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load some data. Please refresh the page.
        </div>
      )}

      <CheckInsDashboard
        goals={JSON.parse(JSON.stringify(goals))}
        initialCheckIns={JSON.parse(JSON.stringify(checkIns))}
        currentYear={currentYear}
      />
    </div>
  );
}
