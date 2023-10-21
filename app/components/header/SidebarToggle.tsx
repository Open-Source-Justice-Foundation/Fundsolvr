"use client"

import useSidebarStore from "@/app/stores/sidebarStore";

import { Bars3Icon } from "@heroicons/react/24/outline";

export default function SidebarToggle() {
  const { toggleSidebar } = useSidebarStore();
  return (
    <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 md:hidden" onClick={() => toggleSidebar()}>
      <span className="sr-only">Open sidebar</span>
      <Bars3Icon className="h-8 w-8" aria-hidden="true" />
    </button>
  );
}
