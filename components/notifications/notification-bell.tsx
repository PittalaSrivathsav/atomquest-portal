"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  Info,
  Loader2,
  Target,
  AlertCircle,
  TrendingUp,
  CheckCheck,
} from "lucide-react";

import type { AppNotification } from "@/types/notification";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Icon map
// ---------------------------------------------------------------------------
function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case "goal_submitted":
    case "goal_created":
      return <Target className="h-4 w-4 text-blue-500" />;
    case "goal_approved":
      return <Target className="h-4 w-4 text-emerald-500" />;
    case "goal_rejected":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "goal_updated":
      return <Target className="h-4 w-4 text-amber-500" />;
    case "goal_deleted":
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    case "check_in_submitted":
    case "check_in_reminder":
      return <TrendingUp className="h-4 w-4 text-violet-500" />;
    case "manager_feedback":
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setIsLoading(true);
    const result = await getNotifications();
    if (result.success) {
      setNotifications(result.data);
    }
    setIsLoading(false);
  }, []);

  // Fetch on mount and every 60s
  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  // Refresh when popover is opened
  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsAsRead();
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        id="notification-bell-trigger"
        className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[380px] p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              id="mark-all-read-btn"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />

        {/* Body */}
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            /* Loading state */
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading notifications…
              </p>
            </div>
          ) : notifications.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <Bell className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  No notifications yet. Actions like creating goals or
                  submitting check-ins will appear here.
                </p>
              </div>
            </div>
          ) : (
            /* List */
            <div className="flex flex-col divide-y">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                    !n.isRead && "bg-muted/20",
                  )}
                >
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0 rounded-full border bg-background p-1.5 shadow-sm">
                    <NotifIcon type={n.type} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-snug">{n.title}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id);
                            setIsOpen(false);
                          }}
                        >
                          View →
                        </Link>
                      )}
                      {!n.isRead && (
                        <button
                          className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => handleMarkAsRead(n.id)}
                          disabled={isPending}
                        >
                          <Check className="h-3 w-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div
                      aria-hidden
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
