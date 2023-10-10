"use client";

import { Fragment } from "react";

import useSidebarStore from "@/app/stores/sidebarStore";
import { Bars3Icon } from "@heroicons/react/24/outline";

import Login from "./Login";

export default function Header() {
  const { toggleSidebar } = useSidebarStore();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-gray-200 lg:hidden" onClick={() => toggleSidebar()}>
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6 pr-4">
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
  );
}
