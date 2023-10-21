import { cookies } from "next/headers";
import Link from "next/link";

import { Theme } from "@/app/types";
import { BellIcon } from "@heroicons/react/24/outline";

import Login from "./Login";
import SidebarToggle from "./SidebarToggle";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const theme = cookies().get("theme")?.value === "dark" ? Theme.dark : Theme.light;

  return (
    <div className="container mx-auto flex max-w-4xl flex-col border-b border-gray-100 dark:border-gray-800">
      <div className="top-0 z-40 flex h-16 w-full shrink-0 items-center gap-x-4 py-12 shadow-sm">
        <div className="flex flex-1 justify-end gap-x-4 self-stretch px-4 lg:px-0">
          <div className="flex w-full items-center justify-between">
            <SidebarToggle />
            <Link className="hidden md:flex" href="/">
              <div className="flex items-center gap-x-2">
                <img
                  className="h-8"
                  src="https://user-images.githubusercontent.com/29136904/276887775-0b18141f-1b7b-48c1-9df2-77f0509ad8d7.png"
                  alt="Your Company"
                />
                <div className="hidden text-4xl text-black dark:text-white sm:block">resolvr</div>
              </div>
            </Link>
            <div className="flex items-center gap-x-6">
              <ThemeToggle theme={theme} />
              <div className="cursor-pointer rounded-full p-2 shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/10 backdrop-blur hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-gray-800/90">
            <Link href="/messages">
                <BellIcon className="h-6 w-6 stroke-gray-600 dark:stroke-gray-300" />
            </Link>
              </div>
              <Login>
                <div className="flex flex-1 justify-end">
                  <a href="#" className="dark:text-smoke-100 text-sm font-semibold leading-6 text-gray-700 dark:text-gray-200">
                    Log in <span aria-hidden="true">&rarr;</span>
                    {/* <UserCircleIcon className="h-7 w-7 text-smoke-400" aria-hidden="true" /> */}
                  </a>
                </div>
              </Login>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
