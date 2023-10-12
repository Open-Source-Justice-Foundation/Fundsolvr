"use client";

import { Fragment, useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import useSidebarStore from "@/app/stores/sidebarStore";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  HomeIcon,
  PlusCircleIcon,
  ServerStackIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";

import { useUserProfileStore } from "../stores/userProfileStore";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const { getUserPublicKey } = useUserProfileStore();
  const { sidebarOpen, toggleSidebar } = useSidebarStore();

  const [publicKey, setPublicKey] = useState<String>("");
  const pathname = usePathname();

  const router = useRouter();

  function navigateToCreate() {
    router.push("/create");
  }

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon, current: true, matchPattern: /^\/b\// },
    { name: "Messages", href: "messages", icon: ChatBubbleLeftIcon, current: false, matchPattern: /^\/m\// },
    { name: "Profile", href: `/u/${publicKey}`, icon: UserIcon, current: false, matchPattern: /^$/ },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon, current: false, matchPattern: /^$/ },
  ];

  useEffect(() => {
    setPublicKey(nip19.npubEncode(getUserPublicKey()));
  }, []);

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={toggleSidebar}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/70" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => toggleSidebar()}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                  <Link href="/">
                    <div className="flex h-16 shrink-0 cursor-pointer items-center gap-2">
                      <img
                        className="h-12 w-auto"
                        src="https://user-images.githubusercontent.com/29136904/272774397-7a9461f7-eda2-46c7-9564-1dd90f6cdab2.png"
                        alt="Your Company"
                      />
                      <h1 className="text-lg font-medium text-white">resolvr</h1>
                    </div>
                  </Link>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.length > 0 &&
                            navigation.map((item) => (
                              <li key={item.name} onClick={() => toggleSidebar()}>
                                <Link href={item.href}>
                                  <div
                                    className={classNames(
                                      pathname === item.href || item.matchPattern.test(pathname)
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                                      "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                    )}
                                  >
                                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                    {item.name}
                                  </div>
                                </Link>
                              </li>
                            ))}
                        </ul>

                        <button
                          className="group mt-4 flex w-full justify-center gap-x-3 rounded-md bg-indigo-600 p-2 text-sm font-semibold leading-6 text-gray-100 hover:bg-indigo-500 hover:text-white"
                          onClick={navigateToCreate}
                        >
                          Create Bounty
                        </button>
                      </li>
                      <li className="mt-auto">
                        <Link
                          href="#"
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          <ServerStackIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          Relays
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
