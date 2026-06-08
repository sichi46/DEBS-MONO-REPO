import { useState, useEffect } from "react";

const STORAGE_KEY = "debs-theme";

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "dark";
  } catch (_e) {
    // localStorage unavailable (private browsing)
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export function useDarkMode() {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch (_e) {
      // localStorage unavailable
    }
  }, [dark]);

  return [dark, setDark] as const;
}
