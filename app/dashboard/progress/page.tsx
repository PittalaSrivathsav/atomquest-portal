import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";
import { getGoals } from "@/actions/goals";

export const metadata: Metadata = {
  title: "Progress | AtomQuest Portal",
  description: "Track milestones and completion over time.",
};

export default async function ProgressPage() {
  const result = await getGoals();
  const goals = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress Analytics"
        description="Track milestones and completion over time."
      />

      {!result.success && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error} — try refreshing the page.
        </div>
      )}

      <ProgressDashboard goals={goals} />
    </div>
  );
}
