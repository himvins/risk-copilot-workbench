
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { messageBus } from "@/lib/messageBus";
import { MessageTopics } from "@/lib/messageTopics";
import { useThemeService } from "@/lib/themeService";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const themeService = useThemeService();
  
  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync next-themes with our theme service
  useEffect(() => {
    if (mounted && resolvedTheme) {
      // Only sync if there's a mismatch
      if (themeService.currentTheme !== resolvedTheme) {
        themeService.setTheme(resolvedTheme as 'light' | 'dark');
      }
    }
  }, [mounted, resolvedTheme, themeService]);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    console.log("Current theme:", resolvedTheme);
    setTheme(newTheme);
    
    // Sync with theme service
    themeService.setTheme(newTheme as 'light' | 'dark');
    
    console.log("Switching to:", newTheme);
  };

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
