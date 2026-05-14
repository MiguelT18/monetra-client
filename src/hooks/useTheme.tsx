"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

/** Solo en cliente: lee localStorage y, si no hay clave, el tema del sistema. */
function readStoredOrSystemTheme(): Theme {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  // Valor fijo en SSR y primer render cliente para que coincida con la hidratación.
  const [theme, setTheme] = useState<Theme>("dark");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const resolved = readStoredOrSystemTheme();
      setTheme(resolved);
      applyThemeToDocument(resolved);
      localStorage.setItem("theme", resolved);
      return;
    }

    applyThemeToDocument(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const clearPreference = () => {
    localStorage.removeItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(prefersDark.matches ? "dark" : "light");
  };

  return { theme, toggle, clearPreference };
}
