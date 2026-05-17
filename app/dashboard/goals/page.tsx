import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { GoalList } from "@/components/goals/goal-list";
import { getGoals } from "@/actions/goals";

export const metadata: Metadata = {
  title: "Goals | AtomQuest Portal",
  description: "Create and manage your goals.",
};

export default async function GoalsPage() {
  const result = await getGoals();
  const goals = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Create, track and manage your goals."
      />

      {!result.success && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {result.error} — try refreshing the page.
        </div>
      )}

      <GoalList initialGoals={goals} />
    </div>
  );
}
