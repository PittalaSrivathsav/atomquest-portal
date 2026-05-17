import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getGoals } from "@/actions/goals";
import { getMyCheckIns } from "@/actions/check-ins";
import { getAuditLogs } from "@/actions/audit";
import { getNotifications } from "@/actions/notifications";

export const metadata: Metadata = {
  title: "Dashboard | AtomQuest Portal",
  description: "Your enterprise goal tracking overview.",
};

export default async function DashboardPage() {
  const currentYear = new Date().getFullYear();

  const [goalsRes, checkInsRes, auditLogsRes, notificationsRes] = await Promise.all([
    getGoals(),
    getMyCheckIns(currentYear),
    getAuditLogs({}),
    getNotifications(),
  ]);

  const goals = goalsRes.success ? goalsRes.data : [];
  const checkIns = checkInsRes.success ? checkInsRes.data : [];
  const auditLogs = auditLogsRes.success ? auditLogsRes.data.logs : [];
  const notifications = notificationsRes.success ? notificationsRes.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Monitor your goals, progress, and recent activity."
      />

      <DashboardOverview
        goals={JSON.parse(JSON.stringify(goals))}
        checkIns={JSON.parse(JSON.stringify(checkIns))}
        auditLogs={JSON.parse(JSON.stringify(auditLogs))}
        notifications={JSON.parse(JSON.stringify(notifications))}
      />
    </div>
  );
}
