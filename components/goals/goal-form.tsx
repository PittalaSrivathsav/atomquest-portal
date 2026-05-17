"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createGoalSchema, type CreateGoalInput } from "@/lib/validations/goal";
import { createGoal, updateGoal } from "@/actions/goals";
import type { Goal } from "@/types/goal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { toast } from "sonner";

type GoalFormProps = {
  /** If provided the form is in "edit" mode */
  goal?: Goal;
  onSuccess?: (goal: Goal) => void;
  onCancel?: () => void;
};

export function GoalForm({ goal, onSuccess, onCancel }: GoalFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: goal?.title ?? "",
      description: goal?.description ?? "",
      status: goal?.status ?? "draft",
      priority: goal?.priority ?? "medium",
      targetDate: goal?.targetDate
        ? new Date(goal.targetDate).toISOString().split("T")[0]
        : "",
      progress: goal?.progress ?? 0,
    },
  });

  function onSubmit(values: CreateGoalInput) {
    startTransition(async () => {
      const result = goal
        ? await updateGoal(goal.id, values)
        : await createGoal(values);

      if (!result.success) {
        setError("root", { message: result.error });
        toast.error(goal ? "Failed to update goal" : "Failed to create goal", {
          description: result.error,
        });
        return;
      }

      toast.success(goal ? "Goal updated successfully" : "Goal created successfully");
      onSuccess?.(result.data);
    });
  }

  const isApproved = goal?.status === "approved";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      id="goal-form"
    >
      {/* Root-level error */}
      {errors.root && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      {isApproved && (
        <div className="rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
          This goal has been approved and is locked from editing.
        </div>
      )}

      <fieldset disabled={isApproved} className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="goal-title">Goal title</Label>
          <Input
            id="goal-title"
            placeholder="e.g. Launch Q3 product roadmap"
            {...register("title")}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-sm font-medium text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="goal-description">Description</Label>
          <Textarea
            id="goal-description"
            placeholder="Describe your goal in detail…"
            className="min-h-[100px] resize-none"
            {...register("description")}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-sm font-medium text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status + Priority row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goal-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isApproved}>
                  <SelectTrigger id="goal-status" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted for Approval</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    {/* Only show approved/rejected if currently in that state to prevent crash, though employees shouldn't set it to this */}
                    {["approved", "rejected"].includes(field.value) && (
                      <SelectItem value={field.value} className="capitalize">
                        {field.value}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm font-medium text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-priority">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isApproved}>
                  <SelectTrigger id="goal-priority" aria-invalid={!!errors.priority}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-sm font-medium text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        {/* Target date + Progress row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="goal-target-date">Target date</Label>
            <Input
              id="goal-target-date"
              type="date"
              {...register("targetDate")}
              aria-invalid={!!errors.targetDate}
            />
            <p className="text-sm text-muted-foreground">Optional deadline</p>
            {errors.targetDate && (
              <p className="text-sm font-medium text-destructive">
                {errors.targetDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-progress">Progress (%)</Label>
            <Controller
              control={control}
              name="progress"
              render={({ field }) => (
                <Input
                  id="goal-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  aria-invalid={!!errors.progress}
                  disabled={isApproved}
                />
              )}
            />
            {errors.progress && (
              <p className="text-sm font-medium text-destructive">
                {errors.progress.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            id="goal-form-cancel"
          >
            {isApproved ? "Close" : "Cancel"}
          </Button>
        )}
        {!isApproved && (
          <Button type="submit" disabled={isPending} id="goal-form-submit">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {goal ? "Save changes" : "Create goal"}
          </Button>
        )}
      </div>
    </form>
  );
}
