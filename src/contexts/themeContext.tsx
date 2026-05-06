"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeContextType {
  theme: "light" | "dark";
  toggle: () => void;
  clearPreference: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
