"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Target,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Bell,
  Plus,
  BarChart as BarChartIcon,
  Users,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import type { Goal } from "@/types/goal";
import type { CheckIn } from "@/types/check-in";
import type { AuditLog } from "@/types/audit-log";
import type { AppNotification } from "@/types/notification";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Enterprise Colors ---
const COLORS = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
};

const STATUS_COLORS = {
  active: COLORS.blue,
  approved: COLORS.emerald,
  completed: COLORS.emerald,
  rejected: COLORS.rose,
  submitted: COLORS.amber,
  draft: "hsl(var(--muted-foreground))",
};

export function DashboardOverview({
  goals,
  checkIns,
  auditLogs,
  notifications,
}: {
  goals: Goal[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}) {
  // --- Derived Stats ---
  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.status === "active").length;
  const approvedGoals = goals.filter((g) => g.status === "approved" || g.status === "completed").length;
  const pendingReviews = goals.filter((g) => g.status === "submitted").length;
  
  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
      : 0;

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  // --- Chart Data ---
  const statusData = useMemo(() => {
    const counts = goals.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || COLORS.blue,
    }));
  }, [goals]);

  const quarterlyData = useMemo(() => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    return quarters.map((q) => {
      const qCheckIns = checkIns.filter((c) => c.quarter === q);
      return {
        name: q,
        Planned: qCheckIns.reduce((acc, c) => acc + (c.plannedValue || 0), 0),
        Actual: qCheckIns.reduce((acc, c) => acc + (c.actualValue || 0), 0),
      };
    });
  }, [checkIns]);

  const priorityData = useMemo(() => {
    const counts = goals.reduce((acc, g) => {
      acc[g.priority] = (acc[g.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "High", value: counts["high"] || 0, color: COLORS.rose },
      { name: "Medium", value: counts["medium"] || 0, color: COLORS.amber },
      { name: "Low", value: counts["low"] || 0, color: COLORS.blue },
    ].filter((d) => d.value > 0);
  }, [goals]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold sm:text-3xl">{totalGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeGoals} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold sm:text-3xl">{avgProgress}%</div>
            <Progress value={avgProgress} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold sm:text-3xl">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting manager approval
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-md border-t-4 border-t-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold sm:text-3xl">{unreadNotifs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all updates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. CHARTS & INSIGHTS */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4 transition-all hover:shadow-sm">
          <CardHeader>
            <CardTitle>Quarterly Performance</CardTitle>
            <CardDescription>Planned vs Actual achievements by quarter</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <filter id="barGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.05" />
                    </filter>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.9}/>
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip
  separator=" : "
  wrapperStyle={{
    outline: "none",
    background: "transparent",
  }}
  cursor={{ fill: "rgba(255,255,255,0.04)" }}
  contentStyle={{
    backgroundColor: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    padding: "10px 12px",
  }}
  itemStyle={{
    color: "#ffffff",
    fontSize: "13px",
  }}
  labelStyle={{
    color: "#9ca3af",
    marginBottom: "4px",
    fontWeight: 500,
  }}
/>
                  <Bar dataKey="Planned" fill="url(#colorPlanned)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlow)" />
                  <Bar dataKey="Actual" fill="url(#colorActual)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlow)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 transition-all hover:shadow-sm">
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Current state of all tracked goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <defs>
                      <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.08" />
                      </filter>
                    </defs>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                      animationDuration={1200}
                      filter="url(#pieShadow)"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip
  separator=" : "
  wrapperStyle={{
    outline: "none",
    background: "transparent",
  }}
  cursor={false}
  contentStyle={{
    backgroundColor: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    padding: "10px 12px",
  }}
  itemStyle={{
    color: "#ffffff",
    fontSize: "13px",
  }}
  labelStyle={{
    color: "#9ca3af",
    fontWeight: 500,
  }}
/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Target className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No goals to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. QUICK ACTIONS & RECENT GOALS */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="transition-all hover:shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcut to common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button render={<Link href="/dashboard/goals/new" />} className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="mr-2 h-4 w-4" /> Create New Goal
              </Button>
              <Button render={<Link href="/dashboard/check-ins" />} variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" /> Submit Check-in
              </Button>
              <Button render={<Link href="/dashboard/manager" />} variant="outline" className="w-full justify-start">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Manager Reviews
              </Button>
              <Button render={<Link href="/dashboard/admin/reports" />} variant="ghost" className="w-full justify-start text-muted-foreground">
                <BarChartIcon className="mr-2 h-4 w-4" /> View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="transition-all hover:shadow-sm flex flex-col h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-4 w-4" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-[320px] px-6">
                <div className="space-y-4 pb-4">
                  {auditLogs.length > 0 ? (
                    auditLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start gap-4">
                        <div className="mt-0.5 relative">
                          <div className="absolute top-4 bottom-[-16px] left-1/2 w-[1px] -translate-x-1/2 bg-border last:hidden" />
                          <div className="relative z-10 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                        </div>
                        <div className="flex flex-col gap-0.5 pb-2">
                          <p className="text-sm font-medium leading-none">
                            <span className="capitalize">{log.action}</span>{" "}
                            {log.entityType.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="transition-all hover:shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Goals</CardTitle>
                <CardDescription>Your latest strategic objectives</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/dashboard/goals" />}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goals.length > 0 ? (
                  goals.slice(0, 5).map((goal) => (
                    <Link 
                      href={`/dashboard/goals/${goal.id}`} 
                      key={goal.id}
                      className="group flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate font-semibold leading-none group-hover:text-primary transition-colors">
                            {goal.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <span>Due {format(new Date(goal.targetDate || new Date()), "MMM d, yyyy")}</span>
                            <span>•</span>
                            <span className="capitalize">{goal.priority} Priority</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="capitalize shrink-0">
                          {goal.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={goal.progress} className="h-1.5" />
                        </div>
                        <span className="text-xs font-medium tabular-nums w-8 text-right">
                          {goal.progress}%
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
                    <Target className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium">No goals found</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">Create a goal to start tracking progress</p>
                    <Button size="sm" render={<Link href="/dashboard/goals/new" />}>
                      Create Goal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
