"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Download, Target, TrendingUp, Users, CheckCircle2, Loader2, Filter } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

import type { AdminReportData, AdminReportFilters } from "@/actions/admin";
import { exportToCSV, exportToExcel } from "@/lib/utils/export";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type AdminDashboardProps = {
  data: AdminReportData;
  initialFilters: AdminReportFilters;
};

export function AdminDashboard({ data, initialFilters }: AdminDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<AdminReportFilters>({
    year: initialFilters.year || new Date().getFullYear(),
    quarter: initialFilters.quarter || "all",
    userId: initialFilters.userId || "all",
    status: initialFilters.status || "all",
    priority: initialFilters.priority || "all",
  });

  const handleFilterChange = (key: keyof AdminReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const resetFilters = () => {
    const defaultFilters = {
      year: new Date().getFullYear(),
      quarter: "all",
      userId: "all",
      status: "all",
      priority: "all",
    };
    setFilters(defaultFilters);
    
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleExportCSV = () => {
    exportToCSV(data.rows, `atomquest-reports-${formatDate(new Date())}.csv`);
    toast.success("CSV Export successful");
  };

  const handleExportExcel = () => {
    exportToExcel(data.rows, `atomquest-reports-${formatDate(new Date())}.xlsx`);
    toast.success("Excel Export successful");
  };

  // Group data for the chart (by quarter or employee)
  const chartData = data.rows.reduce((acc, row) => {
    const key = filters.userId !== "all" ? row.quarter : row.employeeName.split(" ")[0]; // simplify name
    const existing = acc.find(item => item.name === key);
    if (existing) {
      existing.planned += row.plannedValue;
      existing.actual += row.actualValue;
    } else {
      acc.push({ name: key, planned: row.plannedValue, actual: row.actualValue });
    }
    return acc;
  }, [] as any[]);

  const chartConfig = {
    planned: { label: "Planned", color: "#3b82f6" }, // Premium Blue
    actual: { label: "Actual", color: "#10b981" },   // Premium Emerald
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Goals Tracked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalGoals}</div>
            <p className="text-xs text-muted-foreground">Unique goals in dataset</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Goal Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.avgProgress}%</div>
            <p className="text-xs text-muted-foreground">Across all filtered goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Planned Value</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPlanned}</div>
            <p className="text-xs text-muted-foreground">Sum of planned achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.completionPercentage}%</div>
            <p className="text-xs text-muted-foreground">Actual vs Planned ratio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Filters Panel — full width on mobile, side panel on lg */}
        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={String(filters.year)} onValueChange={(v: string | null) => v && handleFilterChange("year", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(new Date().getFullYear() - 1)}>{new Date().getFullYear() - 1}</SelectItem>
                  <SelectItem value={String(new Date().getFullYear())}>{new Date().getFullYear()}</SelectItem>
                  <SelectItem value={String(new Date().getFullYear() + 1)}>{new Date().getFullYear() + 1}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quarter</Label>
              <Select value={filters.quarter || ""} onValueChange={(v: string | null) => v && handleFilterChange("quarter", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={filters.userId || ""} onValueChange={(v: string | null) => v && handleFilterChange("userId", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {data.employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal Status</Label>
              <Select value={filters.status || ""} onValueChange={(v: string | null) => v && handleFilterChange("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal Priority</Label>
              <Select value={filters.priority || ""} onValueChange={(v: string | null) => v && handleFilterChange("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button onClick={applyFilters} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Filters
              </Button>
              <Button variant="outline" onClick={resetFilters} disabled={isPending}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart and Table Area */}
        <div className="lg:col-span-3 space-y-4">
          {data.rows.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Planned vs Actual Performance</CardTitle>
                <CardDescription>
                  {filters.userId === "all" ? "Aggregated by Employee" : "Aggregated by Quarter"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[220px] w-full sm:h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <filter id="barGlowAdmin" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.05" />
                        </filter>
                        <linearGradient id="colorAdminPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-planned)" stopOpacity={0.9}/>
                          <stop offset="95%" stopColor="var(--color-planned)" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="colorAdminActual" x1="0" y1="0" x2="0" y2="1">
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
                      <Bar dataKey="planned" fill="url(#colorAdminPlanned)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlowAdmin)" />
                      <Bar dataKey="actual" fill="url(#colorAdminActual)" radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={true} animationDuration={1200} filter="url(#barGlowAdmin)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Detailed Report</CardTitle>
                <CardDescription>Showing {data.rows.length} records</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={data.rows.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={data.rows.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                  <TableHead className="hidden sm:table-cell">Quarter</TableHead>
                      <TableHead className="hidden md:table-cell">Goal</TableHead>
                      <TableHead className="text-right">Planned</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No data matches your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {row.employeeName}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">
                            <Badge variant="outline">{row.quarter} {row.year}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={row.goalTitle}>
                            {row.goalTitle}
                          </TableCell>
                          <TableCell className="text-right font-medium">{row.plannedValue}</TableCell>
                          <TableCell className="text-right font-medium">{row.actualValue}</TableCell>
                          <TableCell>
                            <Badge variant={row.checkInStatus === "completed" ? "default" : "secondary"}>
                              {row.checkInStatus.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
