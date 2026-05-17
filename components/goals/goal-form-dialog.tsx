"use client";

import type { Goal } from "@/types/goal";
import { GoalForm } from "@/components/goals/goal-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GoalFormDialogProps = {
  open: boolean;
  goal?: Goal;
  onOpenChange: (open: boolean) => void;
  onSuccess: (goal: Goal) => void;
};

export function GoalFormDialog({
  open,
  goal,
  onOpenChange,
  onSuccess,
}: GoalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle id="goal-dialog-title">
            {goal ? "Edit goal" : "Create a new goal"}
          </DialogTitle>
          <DialogDescription>
            {goal
              ? "Update the details of your goal below."
              : "Fill in the details below to create a new goal."}
          </DialogDescription>
        </DialogHeader>

        <GoalForm
          goal={goal}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
