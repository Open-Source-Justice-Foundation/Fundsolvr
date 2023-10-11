"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import useSidebarStore from "@/app/stores/sidebarStore";
import { Bars3Icon } from "@heroicons/react/24/outline";

import Login from "./Login";

export default function Header() {
  const { toggleSidebar } = useSidebarStore();

  const router = useRouter();

  function navigateToCreate() {
    router.push("/create");
  }

  return (
    <div className="container top-0 z-40 mx-auto flex h-16 shrink-0 items-center gap-x-4 py-14 shadow-sm">
      <div className="flex flex-1 justify-end gap-x-4 self-stretch ">
        <div className="flex w-full items-center justify-between">
          <button type="button" className="-m-2.5 p-2.5 pl-6 md:pl-0 text-gray-200 md:hidden" onClick={() => toggleSidebar()}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-8 w-8" aria-hidden="true" />
          </button>
          <Link className="hidden md:flex" href="/">
            <div className="flex items-center gap-x-2">
              <img
                className="h-20"
                src="https://user-images.githubusercontent.com/29136904/272774397-7a9461f7-eda2-46c7-9564-1dd90f6cdab2.png"
                alt="Your Company"
              />
              <div className="text-4xl text-white">resolvr</div>
            </div>
          </Link>
          <div className="flex items-center gap-x-6">
            <button onClick={navigateToCreate} className="rounded-md bg-green-600 px-2 py-2 font-medium text-white hover:bg-green-700">
              Add Bounty
            </button>
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
  );
}
