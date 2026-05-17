"use client";

import { useState } from "react";
import { Plus, Target, CheckCircle2, Circle, TrendingUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import type { CheckIn } from "@/types/check-in";
import type { Goal } from "@/types/goal";
import { cn } from "@/lib/utils";
import { deleteCheckIn } from "@/actions/check-ins";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CheckInForm } from "./check-in-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type CheckInsDashboardProps = {
  goals: Goal[];
  initialCheckIns: CheckIn[];
  currentYear: number;
};

const STATUS_CONFIG = {
  not_started: { label: "Not Started", icon: Circle, className: "bg-muted text-muted-foreground" },
  on_track: { label: "On Track", icon: TrendingUp, className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

export function CheckInsDashboard({ goals, initialCheckIns, currentYear }: CheckInsDashboardProps) {
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | undefined>();

  const handleOpenNew = () => {
    setEditingCheckIn(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (checkIn: CheckIn) => {
    setEditingCheckIn(checkIn);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this check-in?")) return;
    const result = await deleteCheckIn(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Check-in deleted");
    setCheckIns((prev) => prev.filter((c) => c.id !== id));
  };

  const chartData = checkIns.map(c => ({
    name: `${c.quarter} - ${c.goalTitle?.substring(0, 15)}...`,
    planned: c.plannedValue,
    actual: c.actualValue,
  }));

  const chartConfig = {
    planned: { label: "Planned", color: "#3b82f6" },
    actual: { label: "Actual", color: "#10b981" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleOpenNew} disabled={goals.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Check-in
        </Button>
      </div>

      {goals.length === 0 && (
        <div className="rounded-md bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          You need to create a goal first before adding a quarterly check-in.
        </div>
      )}

      {checkIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Planned vs Actual Progress</CardTitle>
            <CardDescription>Overview of your achievements across quarters</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <filter id="barGlowCheckIn" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.05" />
                    </filter>
                    <linearGradient id="colorCheckInPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-planned)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-planned)" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorCheckInActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    content={<ChartTooltipContent />} 
                  />
                  <Bar dataKey="planned" fill="url(#colorCheckInPlanned)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlowCheckIn)" />
                  <Bar dataKey="actual" fill="url(#colorCheckInActual)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlowCheckIn)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checkIns.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
            <Target className="mb-4 h-10 w-10 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No check-ins found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record your quarterly progress against your goals.</p>
          </div>
        ) : (
          checkIns.map((checkIn) => {
            const status = STATUS_CONFIG[checkIn.status];
            const StatusIcon = status.icon;
            const progress = checkIn.plannedValue > 0 ? Math.round((checkIn.actualValue / checkIn.plannedValue) * 100) : 0;

            return (
              <Card key={checkIn.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div>
                    <Badge variant="outline" className="mb-2 font-mono text-xs">{checkIn.quarter} {checkIn.year}</Badge>
                    <CardTitle className="text-base line-clamp-2">{checkIn.goalTitle}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      aria-label="Options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(checkIn)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(checkIn.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className={cn("text-xs gap-1", status.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {progress}% achieved
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-3 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Planned</p>
                      <p className="font-semibold">{checkIn.plannedValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual</p>
                      <p className="font-semibold">{checkIn.actualValue}</p>
                    </div>
                  </div>

                  {checkIn.managerComment && (
                    <div className="rounded-md border-l-2 border-primary bg-primary/5 p-3 text-xs">
                      <span className="font-semibold text-primary block mb-1">Manager feedback:</span>
                      <span className="text-muted-foreground line-clamp-3">{checkIn.managerComment}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCheckIn ? "Edit Check-in" : "New Quarterly Check-in"}</DialogTitle>
            <DialogDescription>Record your progress for a specific quarter.</DialogDescription>
          </DialogHeader>
          <CheckInForm
            goals={goals}
            currentYear={currentYear}
            checkIn={editingCheckIn}
            onSuccess={(newCheckIn) => {
              setCheckIns((prev) => {
                if (editingCheckIn) {
                  return prev.map((c) => (c.id === newCheckIn.id ? newCheckIn : c));
                }
                return [...prev, newCheckIn];
              });
              setIsDialogOpen(false);
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
