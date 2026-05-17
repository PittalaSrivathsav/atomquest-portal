"use client";

import { usePathname } from "next/navigation";

import { dashboardNav } from "@/config/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";

function getPageMeta(pathname: string) {
  const match = dashboardNav.find((item) => item.href === pathname);
  return {
    title: match?.title ?? "Dashboard",
    description: match?.description,
  };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { title, description } = getPageMeta(pathname);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground hidden truncate text-xs sm:block">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
