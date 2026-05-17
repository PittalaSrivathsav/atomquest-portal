"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow, format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Archive,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { Goal, GoalPriority, GoalStatus } from "@/types/goal";
import { deleteGoal } from "@/actions/goals";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// -------------------------------------------------------------------------
// Static maps for badges / icons
// -------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  draft: {
    label: "Draft",
    icon: Circle,
    className: "bg-muted text-muted-foreground border-transparent",
  },
  submitted: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  rejected: {
    label: "Rejected",
    icon: Trash2, // Or a different icon
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
  active: {
    label: "Active",
    icon: Clock,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "bg-muted text-muted-foreground border-transparent",
  },
};

const PRIORITY_CONFIG: Record<
  GoalPriority,
  { label: string; className: string }
> = {
  low: { label: "Low", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  medium: { label: "Medium", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  high: { label: "High", className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const PROGRESS_COLOR: Record<string, string> = {
  low: "[&>div]:bg-slate-400",
  mid: "[&>div]:bg-primary",
  done: "[&>div]:bg-green-500",
};

function progressColorClass(value: number) {
  if (value >= 100) return PROGRESS_COLOR.done;
  if (value >= 40) return PROGRESS_COLOR.mid;
  return PROGRESS_COLOR.low;
}

// -------------------------------------------------------------------------
// Component
// -------------------------------------------------------------------------
type GoalCardProps = {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDeleted: (goalId: string) => void;
};

export function GoalCard({ goal, onEdit, onDeleted }: GoalCardProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const status = STATUS_CONFIG[goal.status];
  const priority = PRIORITY_CONFIG[goal.priority];
  const StatusIcon = status.icon;

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteGoal(goal.id);
      if (!result.success) {
        toast.error("Failed to delete goal", { description: result.error });
        return;
      }
      
      toast.success("Goal deleted successfully");
      setDeleteDialogOpen(false);
      onDeleted(goal.id);
    });
  }

  return (
    <>
      <Card
        className={cn(
          "group relative flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md",
          isPending && "pointer-events-none opacity-50",
        )}
        id={`goal-card-${goal.id}`}
      >
        {/* Priority stripe */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-l-lg",
            goal.priority === "high" && "bg-red-500",
            goal.priority === "medium" && "bg-amber-400",
            goal.priority === "low" && "bg-slate-300",
          )}
        />

        <CardHeader className="flex flex-row items-start justify-between gap-2 pl-5">
          <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
            {goal.title}
          </CardTitle>

          {/* Context menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              id={`goal-menu-${goal.id}`}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring group-hover:opacity-100"
              aria-label="Goal actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                id={`goal-edit-${goal.id}`}
                onClick={() => onEdit(goal)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                id={`goal-delete-${goal.id}`}
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 pl-5">
          {/* Description */}
          {goal.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {goal.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("gap-1 text-xs", status.className)}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", priority.className)}>
              {priority.label} priority
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium tabular-nums">{goal.progress}%</span>
            </div>
            <Progress
              value={goal.progress}
              className={cn("h-1.5", progressColorClass(goal.progress))}
            />
          </div>

          {/* Manager Comment */}
          {goal.managerComment && (
            <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <span className="font-semibold block mb-0.5 text-foreground">Manager Feedback:</span>
              <span className="line-clamp-2">{goal.managerComment}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between pl-5 pt-0 text-xs text-muted-foreground">
          {goal.targetDate ? (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              Due {format(new Date(goal.targetDate), "MMM d, yyyy")}
            </span>
          ) : (
            <span />
          )}
          <span>
            Updated{" "}
            {formatDistanceToNow(new Date(goal.updatedAt), { addSuffix: true })}
          </span>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal &quot;{goal.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
