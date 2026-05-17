"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative overflow-hidden transition-colors"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <Sun
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
            isDark ? "translate-y-8 opacity-0 rotate-90" : "translate-y-0 opacity-100 rotate-0"
          }`}
        />
        <Moon
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out ${
            isDark ? "translate-y-0 opacity-100 rotate-0" : "-translate-y-8 opacity-0 -rotate-90"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
