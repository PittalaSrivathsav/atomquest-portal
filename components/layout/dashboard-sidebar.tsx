import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { DashboardBrand } from "@/components/layout/dashboard-brand";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <DashboardBrand />
      </SidebarHeader>
      <SidebarContent>
        <DashboardNav />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <p className="text-muted-foreground group-data-[collapsible=icon]:hidden px-2 text-xs">
          v0.1 — Goal tracking portal
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
