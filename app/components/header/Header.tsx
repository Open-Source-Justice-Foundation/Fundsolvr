"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Theme } from "@/app/types";
import { useCookies } from "next-client-cookies";

import DiscordIcon from "../icons/DiscordIcon";
import GithubIcon from "../icons/GithubIcon";
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
    <div className="w-full px-4">
      <div className="container mx-auto flex max-w-screen-xl flex-col dark:border-gray-800">
        <div className="top-0 z-40 flex h-16 w-full shrink-0 items-center gap-x-4 py-12 shadow-sm">
          <div className="flex flex-1 justify-end gap-x-4 self-stretch">
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
                <a href="https://discord.com/invite/VRmwgV3pjP" target="_blank">
                  <DiscordIcon className="stroke-gray-600 hover:stroke-slate-900 dark:stroke-slate-200 dark:hover:stroke-white" />
                </a>
                <a href="https://github.com/Resolvr-io" target="_blank">
                  <GithubIcon className="stroke-gray-600 hover:stroke-slate-900 dark:stroke-slate-200 dark:hover:stroke-white" />
                </a>
                <Login>
                  <div className="flex flex-1 justify-end rounded-3xl bg-slate-600 px-4 py-2 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">
                    <span className="dark:text-smoke-100 text-sm font-semibold leading-6 ">Get Started</span>
                  </div>
                </Login>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
