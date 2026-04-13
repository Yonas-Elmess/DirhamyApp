"use client";

import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dirhamy_theme") as "light" | "dark" | null;
      if (saved) return saved;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync class with actual state on mount
    const isDark = document.documentElement.classList.contains("dark");
    const saved = localStorage.getItem("dirhamy_theme") as "light" | "dark" | null;
    const shouldBeDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (shouldBeDark !== isDark) {
      document.documentElement.classList.toggle("dark", shouldBeDark);
    }
    setTheme(shouldBeDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    // Read directly from DOM to avoid stale closure
    const isDark = document.documentElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("dirhamy_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, []);

  return { theme, toggleTheme, mounted };
}
