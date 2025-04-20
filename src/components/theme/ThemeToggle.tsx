
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { useDynamicReducer } from "@/hooks/useDynamicReducer";
import { themeReducer, setTheme as setReduxTheme } from "@/store/features/theme/themeSlice";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  // Register the dynamic reducer
  useDynamicReducer('theme', themeReducer);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    console.log("Current theme:", resolvedTheme);
    setTheme(newTheme);
    dispatch(setReduxTheme(newTheme));
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
