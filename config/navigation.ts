import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Settings,
  Target,
  TrendingUp,
  Users,
  CheckCircle2,
  FileText,
  History,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const dashboardNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick stats",
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
    description: "Manage your goals",
  },
  {
    title: "Progress",
    href: "/dashboard/progress",
    icon: TrendingUp,
    description: "Track milestones and progress",
  },
  {
    title: "Check-ins",
    href: "/dashboard/check-ins",
    icon: CheckCircle2,
    description: "Quarterly achievement updates",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account and preferences",
  },
  {
    title: "Manager Approvals",
    href: "/dashboard/manager",
    icon: Users,
    description: "Review team goals",
  },
  {
    title: "Admin Reports",
    href: "/dashboard/admin",
    icon: FileText,
    description: "Export and analyze data",
  },
  {
    title: "Audit Logs",
    href: "/dashboard/admin/logs",
    icon: History,
    description: "System changes and history",
  },
];

export const authNav = {
  login: "/login",
  dashboard: "/dashboard",
} as const;
