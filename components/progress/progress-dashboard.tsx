"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { CheckCircle2, Target, TrendingUp, AlertCircle } from "lucide-react";

import type { Goal } from "@/types/goal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ProgressDashboardProps = {
  goals: Goal[];
};

export function ProgressDashboard({ goals }: ProgressDashboardProps) {
  const stats = useMemo(() => {
    const total = goals.length;
    if (total === 0) {
      return { total: 0, completed: 0, avgProgress: 0, statusData: [], priorityData: [] };
    }

    const completed = goals.filter((g) => g.status === "completed").length;
    const avgProgress = Math.round(
      goals.reduce((acc, g) => acc + g.progress, 0) / total,
    );

    const statusCounts: Record<string, number> = { draft: 0, submitted: 0, approved: 0, rejected: 0, active: 0, completed: 0, archived: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0 };

    goals.forEach((g) => {
      statusCounts[g.status]++;
      priorityCounts[g.priority]++;
    });

    const statusData = [
      { name: "Draft", value: statusCounts.draft, fill: "var(--color-draft)" },
      { name: "Submitted", value: statusCounts.submitted, fill: "var(--color-submitted)" },
      { name: "Approved", value: statusCounts.approved, fill: "var(--color-approved)" },
      { name: "Rejected", value: statusCounts.rejected, fill: "var(--color-rejected)" },
      { name: "Active", value: statusCounts.active, fill: "var(--color-active)" },
      { name: "Completed", value: statusCounts.completed, fill: "var(--color-completed)" },
      { name: "Archived", value: statusCounts.archived, fill: "var(--color-archived)" },
    ];

    const priorityData = [
      { name: "Low", value: priorityCounts.low, fill: "var(--color-low)" },
      { name: "Medium", value: priorityCounts.medium, fill: "var(--color-medium)" },
      { name: "High", value: priorityCounts.high, fill: "var(--color-high)" },
    ];

    return { total, completed, avgProgress, statusData, priorityData };
  }, [goals]);

  if (stats.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">No data to display</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Create some goals to see your progress analytics.
        </p>
      </div>
    );
  }

  const statusConfig = {
    draft: { label: "Draft", color: "#64748b" },       // Slate
    submitted: { label: "Submitted", color: "#f59e0b" }, // Amber
    approved: { label: "Approved", color: "#10b981" },   // Emerald
    rejected: { label: "Rejected", color: "#f43f5e" },   // Rose
    active: { label: "Active", color: "#3b82f6" },       // Blue
    completed: { label: "Completed", color: "#10b981" }, // Emerald
    archived: { label: "Archived", color: "#8b5cf6" },   // Violet
  } satisfies ChartConfig;

  const priorityConfig = {
    low: { label: "Low", color: "#3b82f6" },        // Blue
    medium: { label: "Medium", color: "#f59e0b" },  // Amber
    high: { label: "High", color: "#f43f5e" },      // Rose
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all priorities and statuses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completed / stats.total) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Overall goal progression
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Current state of your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="h-[240px] w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <filter id="barGlowProgress" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.05" />
                    </filter>
                    {stats.statusData.map((s) => (
                      <linearGradient key={s.name} id={`color-${s.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={s.fill} stopOpacity={0.9} />
                        <stop offset="95%" stopColor={s.fill} stopOpacity={0.2} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                    tickMargin={10}
                  />
                  <ChartTooltip 
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} 
                    content={<ChartTooltipContent hideLabel />} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} filter="url(#barGlowProgress)">
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#color-${entry.name.replace(/\s+/g, '')})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Goals organized by priority</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={priorityConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadowProgress" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.08" />
                    </filter>
                  </defs>
                  <Pie
                    data={stats.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1200}
                    filter="url(#pieShadowProgress)"
                  >
                    {stats.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={3} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    cursor={false}
                    content={<ChartTooltipContent />} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
