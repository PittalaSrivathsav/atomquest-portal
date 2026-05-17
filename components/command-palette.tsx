"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  Target,
  Plus,
  CheckCircle2,
  BarChart,
  ShieldAlert,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* We don't render a trigger button here by default, it's typically hidden and driven by the hotkey. */}
      {/* But we can expose a small hint in the search bar if we want. For now, it's global hotkey driven. */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/goals/new"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Goal</span>
              <CommandShortcut>G N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/check-ins"))}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Add Check-in</span>
              <CommandShortcut>C I</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Overview</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/goals"))}>
              <Target className="mr-2 h-4 w-4" />
              <span>My Goals</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/manager"))}>
              <User className="mr-2 h-4 w-4" />
              <span>Manager Reviews</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />

          <CommandGroup heading="Admin Tools">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/admin/reports"))}>
              <BarChart className="mr-2 h-4 w-4 text-blue-500" />
              <span>Analytics & Reports</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/admin/logs"))}>
              <ShieldAlert className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Audit Logs</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
