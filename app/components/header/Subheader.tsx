import Link from "next/link";

import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export default function Subheader() {
  return (
    <div className="hidden w-full border-y border-b-gray-700 border-t-gray-700 text-white md:flex">
      <div className="container mx-auto flex max-w-7xl justify-between px-4">
        <div className="flex flex-row items-center gap-x-6 text-sm font-semibold leading-6 text-gray-400">
          <Link href="/messages">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Messages</span>
          </Link>
          <Link href="/u/asdf">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Profile</span>
          </Link>
          <Link href="/settings">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Settings</span>
          </Link>
        </div>
        <div className="flex gap-x-4">
          <MagnifyingGlassIcon className="text-gray-400 cursor-pointer h-6 w-6 self-center" aria-hidden="true" />
          <button className="flex cursor-pointer items-center gap-x-1 border-l border-gray-700 pl-4 text-sm font-semibold leading-6 text-gray-400">
            Most Recent
            <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex cursor-pointer items-center gap-x-2 border-x border-gray-700 px-4 py-3 hover:bg-gray-800">
            <img
              src="https://avatars.githubusercontent.com/u/104653694?s=280&v=4"
              alt=""
              className="h-6 w-6 flex-none rounded-full bg-gray-800 object-cover"
            />
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400">Damus.io</span>
          </div>
        </div>
      </div>
    </div>
  );
}
