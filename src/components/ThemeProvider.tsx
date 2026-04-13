"use client";

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    // Apply theme from localStorage or system preference
    const applyTheme = () => {
      const saved = localStorage.getItem("dirhamy_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = saved === "dark" || (!saved && prefersDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Watch for external changes (other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dirhamy_theme") applyTheme();
    };
    window.addEventListener("storage", handleStorage);

    // Protect against React removing the class by re-applying on any removal
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const saved = localStorage.getItem("dirhamy_theme");
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          const shouldBeDark = saved === "dark" || (!saved && prefersDark);
          const isDark = document.documentElement.classList.contains("dark");

          if (shouldBeDark && !isDark) {
            document.documentElement.classList.add("dark");
          } else if (!shouldBeDark && isDark) {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("storage", handleStorage);
      observer.disconnect();
    };
  }, []);

  return null;
}
