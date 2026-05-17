import Link from "next/link";
import { Atom } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ROUTES } from "@/lib/constants";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function DashboardBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          render={<Link href={ROUTES.dashboard} />}
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Atom className="size-4" />
          </span>
          <span className="grid flex-1 text-left leading-tight">
            <span className="truncate font-semibold">{siteConfig.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {siteConfig.tagline}
            </span>
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
