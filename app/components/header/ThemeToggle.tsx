import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

import { Theme } from "../../types";

interface Props {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function ThemeToggle({ theme, setTheme }: Props) {

  const toggleTheme = () => {
    const root = document.getElementsByTagName("html")[0];
    root.classList.toggle(Theme.dark);
    root.classList.toggle(Theme.light);
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
      <button onClick={toggleTheme}>
        {theme === Theme.light ? (
          <div className="cursor-pointer rounded-full p-2 shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/10 backdrop-blur hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-gray-800/90">
            <SunIcon className="h-6 w-6 stroke-teal-400" />
          </div>
        ) : (
          <div className="cursor-pointer rounded-full p-2 shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/10 backdrop-blur hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-gray-800/90">
            <MoonIcon className="h-6 w-6 stroke-purple-500" />
          </div>
        )}
      </button>
    </>
  );
}
