"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // On mount, read from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("decko-theme") as Theme | null;
    const resolved = stored ?? "system";
    setThemeState(resolved);
    setMounted(true);
    // Sync cookie on mount
    document.cookie = `decko-theme=${resolved}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  // Update DOM classes and register listener for system preference change
  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (next: Theme) => {
    localStorage.setItem("decko-theme", next);
    if (typeof window !== "undefined") {
      document.cookie = `decko-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  
  let isDark = false;
  if (theme === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = theme === "dark";
  }

  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}
