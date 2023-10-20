"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import useSidebarStore from "@/app/stores/sidebarStore";
import { Bars3Icon, BellIcon, MoonIcon } from "@heroicons/react/24/outline";

import Login from "./Login";

export default function Header() {
  const { toggleSidebar } = useSidebarStore();

  const router = useRouter();

  return (
    <div className="container mx-auto flex max-w-5xl flex-col">
      <div className="top-0 z-40 flex h-16 w-full shrink-0 items-center gap-x-4 py-12 shadow-sm">
        <div className="flex flex-1 justify-end gap-x-4 self-stretch px-4 lg:px-0">
          <div className="flex w-full items-center justify-between">
            <button type="button" className="-m-2.5 p-2.5 text-gray-200 md:hidden" onClick={() => toggleSidebar()}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-8 w-8" aria-hidden="true" />
            </button>
            <Link className="hidden md:flex" href="/">
              <div className="flex items-center gap-x-2">
                <img
                  className="h-8"
                  src="https://user-images.githubusercontent.com/29136904/276887775-0b18141f-1b7b-48c1-9df2-77f0509ad8d7.png"
                  alt="Your Company"
                />
                <div className="hidden text-4xl text-white sm:block">resolvr</div>
              </div>
            </Link>
            <div className="flex items-center gap-x-6">
              <MoonIcon className="h-7 w-7 text-gray-300" aria-hidden="true" />
              <BellIcon className="h-7 w-7 text-gray-300" aria-hidden="true" />
              <Login>
                <div className="flex flex-1 justify-end">
                  <a href="#" className="dark:text-smoke-100 text-sm font-semibold leading-6 text-gray-200">
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
