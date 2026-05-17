"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, History, Filter } from "lucide-react";

import type { AuditLogFilters } from "@/actions/audit";
import type { AuditLog } from "@/types/audit-log";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type AuditLogsViewProps = {
  data: {
    logs: AuditLog[];
    users: { id: string; name: string }[];
  };
  initialFilters: AuditLogFilters;
};

export function AuditLogsView({ data, initialFilters }: AuditLogsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<AuditLogFilters>({
    userId: initialFilters.userId || "all",
    action: initialFilters.action || "all",
    entityType: initialFilters.entityType || "all",
    date: initialFilters.date || "all",
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create": return <Badge className="bg-blue-500">Created</Badge>;
      case "update": return <Badge className="bg-amber-500">Updated</Badge>;
      case "delete": return <Badge variant="destructive">Deleted</Badge>;
      case "submit": return <Badge className="bg-indigo-500">Submitted</Badge>;
      case "approve": return <Badge className="bg-green-500">Approved</Badge>;
      case "reject": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>Review the last 200 actions across the system</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-[200px]">
            <Select value={filters.userId || "all"} onValueChange={(v) => handleFilterChange("userId", v)}>
              <SelectTrigger><SelectValue placeholder="All Users" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {data.users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select value={filters.action || "all"} onValueChange={(v) => handleFilterChange("action", v)}>
              <SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="submit">Submit</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select value={filters.entityType || "all"} onValueChange={(v) => handleFilterChange("entityType", v)}>
              <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="check_in">Check-in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[200px]">
            <Select value={filters.date || "all"} onValueChange={(v) => handleFilterChange("date", v)}>
              <SelectTrigger><SelectValue placeholder="Any Date" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border opacity-100 transition-opacity" style={{ opacity: isPending ? 0.6 : 1 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Context</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <History className="mx-auto h-5 w-5 mb-2 opacity-50" />
                    No audit logs found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data.logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.userName}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="capitalize">{log.entityType.replace("_", " ")}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={log.entityTitle}>
                      {log.entityTitle || log.entityId}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
                          View
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Audit Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><span className="font-semibold">User:</span> {log.userName}</div>
                              <div><span className="font-semibold">Action:</span> {log.action}</div>
                              <div><span className="font-semibold">Entity:</span> {log.entityType}</div>
                              <div><span className="font-semibold">ID:</span> {log.entityId}</div>
                              <div className="col-span-2"><span className="font-semibold">Date:</span> {format(new Date(log.createdAt), "PPpp")}</div>
                            </div>
                            
                            {(log.previousValue || log.newValue) && (
                              <div className="grid gap-2 pt-2 border-t mt-2">
                                {log.previousValue && (
                                  <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Previous State</span>
                                    <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px] sm:text-xs">
                                      {JSON.stringify(log.previousValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.newValue && (
                                  <div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">New State</span>
                                    <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px] sm:text-xs">
                                      {JSON.stringify(log.newValue, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
