"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Theme } from "@/app/types";
import { BellIcon } from "@heroicons/react/24/outline";
import { useCookies } from "next-client-cookies";

import Login from "./Login";
import SidebarToggle from "./SidebarToggle";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const cookies = useCookies();
  const [theme, setTheme] = useState<Theme>(cookies.get("theme") === "dark" ? Theme.dark : Theme.light);
  const pathname = usePathname();

  return pathname === "/login" ? (
    <></>
  ) : (
    <div className="container mx-auto flex max-w-4xl flex-col border-b border-gray-100 dark:border-gray-800">
      <div className="top-0 z-40 flex h-16 w-full shrink-0 items-center gap-x-4 py-12 shadow-sm">
        <div className="flex flex-1 justify-end gap-x-4 self-stretch px-4 lg:px-0">
          <div className="flex w-full items-center justify-between">
            <SidebarToggle />
            <Link className="hidden md:flex" href="/">
              <div className="flex items-center gap-x-2">
                {theme === "light" ? (
                  <img
                    className="h-8"
                    src="https://user-images.githubusercontent.com/81318863/280472537-02cdaaa6-493c-4b58-805d-f86fd449f71d.png"
                    alt="resolvr"
                  />
                ) : (
                  <img
                    className="h-8"
                    src="https://user-images.githubusercontent.com/81318863/280472542-76f5046f-806a-407a-9782-3dfbf103e452.png"
                    alt="resolvr"
                  />
                )}
              </div>
            </Link>
            <div className="flex items-center gap-x-6">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <div className="cursor-pointer rounded-full p-2 shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/10 backdrop-blur hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-gray-800/90">
                <Link href="/messages">
                  <BellIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300" />
                </Link>
              </div>
              <Login>
                <div className="flex flex-1 justify-end">
                  <span className="dark:text-smoke-100 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200">
                    Log in <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Login>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
