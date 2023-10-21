"use client";

import { useState } from "react";

import { Theme } from "../../types";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

interface Props {
  theme: Theme;
}

export default function ThemeToggle({ theme }: Props) {
  const [_theme, setTheme] = useState<Theme>(theme);

  const toggleTheme = () => {
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle(Theme.dark);
    if (root.classList.contains(Theme.dark)) {
      setTheme(Theme.dark);
      document.cookie = `theme=${Theme.dark};SameSite=Lax`;
    } else {
      setTheme(Theme.light);
      document.cookie = `theme=${Theme.light};SameSite=Lax`;
    }
  };

  return (
    <>
      <button
        onClick={toggleTheme}
      >
        {_theme === Theme.light ? (
          <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/90 p-2 rounded-full shadow-lg backdrop-blur shadow-gray-800/10 ring-1 ring-gray-900/10 dark:ring-white/10">
            <SunIcon className="h-6 w-6 stroke-teal-400" />
          </div>
        ) : (
          <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/90 p-2 rounded-full shadow-lg backdrop-blur shadow-gray-800/10 ring-1 ring-gray-900/10 dark:ring-white/10">
            <MoonIcon className="h-6 w-6 stroke-purple-500" />
          </div>
        )}
      </button>
    </>
  );
}
