"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { ManagerGoalView, ManagerCheckInView } from "@/actions/manager";
import { reviewGoal, reviewCheckIn } from "@/actions/manager";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ManagerDashboardProps = {
  initialGoals: ManagerGoalView[];
  initialCheckIns: ManagerCheckInView[];
};

export function ManagerDashboard({ initialGoals, initialCheckIns }: ManagerDashboardProps) {
  const [goals, setGoals] = useState(initialGoals);
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [isPending, startTransition] = useTransition();

  // Goal review state
  const [reviewGoalItem, setReviewGoalItem] = useState<ManagerGoalView | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected" | null>(null);
  const [comment, setComment] = useState("");

  // Check-in review state
  const [reviewCheckInItem, setReviewCheckInItem] = useState<ManagerCheckInView | null>(null);
  const [checkInComment, setCheckInComment] = useState("");

  const handleReviewGoal = () => {
    if (!reviewGoalItem || !reviewAction) return;

    startTransition(async () => {
      const result = await reviewGoal(reviewGoalItem.id, reviewAction, comment);

      if (!result.success) {
        toast.error(`Failed to ${reviewAction} goal`, { description: result.error });
        return;
      }

      toast.success(`Goal ${reviewAction} successfully`);
      setGoals((prev) =>
        prev.map((g) =>
          g.id === reviewGoalItem.id
            ? { ...g, status: reviewAction, managerComment: comment || g.managerComment }
            : g
        )
      );

      setReviewGoalItem(null);
      setReviewAction(null);
      setComment("");
    });
  };

  const handleReviewCheckIn = () => {
    if (!reviewCheckInItem || !checkInComment) return;

    startTransition(async () => {
      const result = await reviewCheckIn(reviewCheckInItem.id, checkInComment);

      if (!result.success) {
        toast.error("Failed to submit feedback", { description: result.error });
        return;
      }

      toast.success("Feedback submitted successfully");
      setCheckIns((prev) =>
        prev.map((c) =>
          c.id === reviewCheckInItem.id
            ? { ...c, managerComment: checkInComment }
            : c
        )
      );

      setReviewCheckInItem(null);
      setCheckInComment("");
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "on_track":
        return <Badge className="bg-blue-500 hover:bg-blue-600">On Track</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{status.replace("_", " ")}</Badge>;
    }
  };

  const pendingGoals = goals.filter((g) => g.status === "submitted");
  const reviewedGoals = goals.filter((g) => g.status === "approved" || g.status === "rejected");

  const unreviewedCheckIns = checkIns.filter(c => !c.managerComment);
  const reviewedCheckIns = checkIns.filter(c => !!c.managerComment);

  return (
    <Tabs defaultValue="goals" className="space-y-6">
      <TabsList>
        <TabsTrigger value="goals">Goal Approvals</TabsTrigger>
        <TabsTrigger value="checkins">Quarterly Check-ins</TabsTrigger>
      </TabsList>

      <TabsContent value="goals" className="space-y-8">
        {/* Pending Reviews Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Needs Review ({pendingGoals.length})</h3>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingGoals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No goals waiting for review.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="font-medium">{goal.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{goal.employeeEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-1">{goal.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                          {goal.description || "No description"}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {goal.targetDate ? format(new Date(goal.targetDate), "MMM d, yyyy") : "None"}
                      </TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setReviewGoalItem(goal);
                              setReviewAction("approved");
                            }}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setReviewGoalItem(goal);
                              setReviewAction("rejected");
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Previously Reviewed Section */}
        {reviewedGoals.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Previously Reviewed ({reviewedGoals.length})</h3>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div className="font-medium">{goal.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{goal.employeeEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-1 max-w-[200px]">{goal.title}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell className="max-w-[300px]">
                        {goal.managerComment ? (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{goal.managerComment}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">No comment provided</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="checkins" className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Pending Check-in Reviews ({unreviewedCheckIns.length})</h3>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unreviewedCheckIns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No check-ins waiting for feedback.
                    </TableCell>
                  </TableRow>
                ) : (
                  unreviewedCheckIns.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell>
                        <div className="font-medium">{checkIn.employeeName}</div>
                        <div className="text-xs text-muted-foreground">{checkIn.employeeEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-1 max-w-[200px]">{checkIn.goalTitle}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{checkIn.quarter} {checkIn.year}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {checkIn.actualValue} / {checkIn.plannedValue}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(checkIn.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewCheckInItem(checkIn);
                            setCheckInComment("");
                          }}
                        >
                          Add Feedback
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {reviewedCheckIns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Reviewed Check-ins ({reviewedCheckIns.length})</h3>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Manager Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewedCheckIns.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell>
                        <div className="font-medium">{checkIn.employeeName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium line-clamp-1 max-w-[200px]">{checkIn.goalTitle}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{checkIn.quarter} {checkIn.year}</TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{checkIn.managerComment}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </TabsContent>

      {/* Goal Review Dialog */}
      <Dialog
        open={!!reviewGoalItem}
        onOpenChange={(open) => {
          if (!open) {
            setReviewGoalItem(null);
            setReviewAction(null);
            setComment("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved" ? "Approve Goal" : "Reject Goal"}
            </DialogTitle>
            <DialogDescription>
              Provide feedback for {reviewGoalItem?.employeeName}&apos;s goal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-3 text-sm">
              <span className="font-semibold block mb-1">{reviewGoalItem?.title}</span>
              <span className="text-muted-foreground">{reviewGoalItem?.description || "No description provided."}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Manager Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                placeholder="Leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewGoalItem(null);
                setReviewAction(null);
                setComment("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "rejected" ? "destructive" : "default"}
              onClick={handleReviewGoal}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewAction === "approved" ? "Approve Goal" : "Reject Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CheckIn Review Dialog */}
      <Dialog
        open={!!reviewCheckInItem}
        onOpenChange={(open) => {
          if (!open) {
            setReviewCheckInItem(null);
            setCheckInComment("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Check-in Feedback</DialogTitle>
            <DialogDescription>
              Leave feedback for {reviewCheckInItem?.employeeName}&apos;s {reviewCheckInItem?.quarter} check-in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 rounded-md bg-muted p-3 text-sm">
              <div>
                <span className="font-semibold block mb-1">Goal</span>
                <span className="text-muted-foreground line-clamp-1">{reviewCheckInItem?.goalTitle}</span>
              </div>
              <div>
                <span className="font-semibold block mb-1">Employee Comment</span>
                <span className="text-muted-foreground line-clamp-2">{reviewCheckInItem?.employeeComment || "None"}</span>
              </div>
              <div>
                <span className="font-semibold block mb-1">Actual vs Planned</span>
                <span className="text-muted-foreground">{reviewCheckInItem?.actualValue} / {reviewCheckInItem?.plannedValue}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin-feedback">Manager Feedback (Required)</Label>
              <Textarea
                id="checkin-feedback"
                placeholder="Great progress this quarter..."
                value={checkInComment}
                onChange={(e) => setCheckInComment(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewCheckInItem(null);
                setCheckInComment("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewCheckIn}
              disabled={isPending || !checkInComment}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
