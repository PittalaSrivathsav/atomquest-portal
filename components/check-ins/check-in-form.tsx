"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createCheckInSchema, type CreateCheckInInput } from "@/lib/validations/check-in";
import { createCheckIn, updateCheckIn } from "@/actions/check-ins";
import type { CheckIn } from "@/types/check-in";
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

type CheckInFormProps = {
  checkIn?: CheckIn;
  goals: Goal[];
  currentYear: number;
  onSuccess?: (checkIn: CheckIn) => void;
  onCancel?: () => void;
};

export function CheckInForm({ checkIn, goals, currentYear, onSuccess, onCancel }: CheckInFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CreateCheckInInput>({
    resolver: zodResolver(createCheckInSchema),
    defaultValues: {
      goalId: checkIn?.goalId ?? "",
      quarter: checkIn?.quarter ?? "Q1",
      year: checkIn?.year ?? currentYear,
      plannedValue: checkIn?.plannedValue ?? 0,
      actualValue: checkIn?.actualValue ?? 0,
      status: checkIn?.status ?? "not_started",
      employeeComment: checkIn?.employeeComment ?? "",
    },
  });

  function onSubmit(values: CreateCheckInInput) {
    startTransition(async () => {
      const result = checkIn
        ? await updateCheckIn(checkIn.id, values)
        : await createCheckIn(values);

      if (!result.success) {
        setError("root", { message: result.error });
        toast.error(checkIn ? "Failed to update check-in" : "Failed to create check-in", {
          description: result.error,
        });
        return;
      }

      toast.success(checkIn ? "Check-in updated successfully" : "Check-in created successfully");
      onSuccess?.(result.data);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {errors.root && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="space-y-2">
        <Label>Goal</Label>
        <Controller
          control={control}
          name="goalId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} disabled={!!checkIn}>
              <SelectTrigger aria-invalid={!!errors.goalId}>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.goalId && <p className="text-sm text-destructive">{errors.goalId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quarter</Label>
          <Controller
            control={control}
            name="quarter"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={!!checkIn}>
                <SelectTrigger aria-invalid={!!errors.quarter}>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.quarter && <p className="text-sm text-destructive">{errors.quarter.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-invalid={!!errors.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Planned Value</Label>
          <Controller
            control={control}
            name="plannedValue"
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={!!errors.plannedValue}
              />
            )}
          />
          {errors.plannedValue && <p className="text-sm text-destructive">{errors.plannedValue.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Actual Value</Label>
          <Controller
            control={control}
            name="actualValue"
            render={({ field }) => (
              <Input
                type="number"
                min={0}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                aria-invalid={!!errors.actualValue}
              />
            )}
          />
          {errors.actualValue && <p className="text-sm text-destructive">{errors.actualValue.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Comments</Label>
        <Textarea
          placeholder="What are your key takeaways this quarter?"
          className="resize-none"
          {...register("employeeComment")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {checkIn ? "Update Check-in" : "Save Check-in"}
        </Button>
      </div>
    </form>
  );
}
