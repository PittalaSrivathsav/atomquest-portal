"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { Goal } from "@/types/goal";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { Button } from "@/components/ui/button";

type GoalListProps = {
  initialGoals: Goal[];
};

export function GoalList({ initialGoals }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  function openCreate() {
    setEditingGoal(undefined);
    setDialogOpen(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setDialogOpen(true);
  }

  function handleSuccess(saved: Goal) {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === saved.id);
      if (exists) {
        return prev.map((g) => (g.id === saved.id ? saved : g));
      }
      return [saved, ...prev];
    });
    setDialogOpen(false);
  }

  function handleDeleted(goalId: string) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {goals.length === 0
            ? "No goals yet. Create your first goal!"
            : `${goals.length} goal${goals.length === 1 ? "" : "s"}`}
        </p>
        <Button id="create-goal-btn" onClick={openCreate} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New goal
        </Button>
      </div>

      {/* Grid */}
      {goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreate={openCreate} />
      )}

      {/* Dialog */}
      <GoalFormDialog
        open={dialogOpen}
        goal={editingGoal}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Plus className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">No goals yet</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Set your first goal to start tracking progress toward what matters most.
      </p>
      <Button id="empty-create-goal-btn" className="mt-6" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create your first goal
      </Button>
    </div>
  );
}
