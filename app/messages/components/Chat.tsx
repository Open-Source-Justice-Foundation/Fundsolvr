import { Fragment } from "react";

import { classNames } from "@/app/lib/utils";
import { Menu, Transition } from "@headlessui/react";
import { SpeakerXMarkIcon, TrashIcon, ClipboardIcon } from "@heroicons/react/24/outline";

import Badge from "./Badge";
import Link from "next/link";

export interface IUser {
  img: string;
  username: string;
  unread: boolean;
  bio: string;
}

interface IChatProps {
  user: IUser;
}

export default function Chat({ user }: IChatProps) {
  const { username, img, unread } = user;
  return (
    <Link href={"#"} className="block rounded-md border border-transparent p-4 text-white hover:bg-gray-800">
      <div className="group flex items-center gap-4">
        <div className="relative h-12 w-12">
          <img src={img} alt={username} className="aspect-square w-full rounded-full" />
          <svg
            className="absolute bottom-1 right-1 w-6 translate-x-1/2 translate-y-1/2"
            viewBox="-4 0 27 19"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="fill-sky-500"
              d="M7.844 17.563c1.039 1.046 2.031 1.039 3.078 0l1.172-1.172c.11-.11.203-.141.344-.141h1.656c1.476 0 2.18-.703 2.18-2.18v-1.656c0-.14.038-.242.14-.344l1.172-1.18c1.047-1.038 1.039-2.03 0-3.07l-1.172-1.172a.454.454 0 0 1-.14-.343V4.648c0-1.476-.704-2.18-2.18-2.18h-1.656a.443.443 0 0 1-.344-.14l-1.172-1.172C9.875.11 8.882.11 7.844 1.164L6.672 2.328a.443.443 0 0 1-.344.14H4.672c-1.477 0-2.18.688-2.18 2.18v1.657c0 .14-.039.242-.14.343L1.18 7.82c-1.047 1.04-1.04 2.032 0 3.07l1.172 1.18c.101.102.14.203.14.344v1.656c0 1.477.703 2.18 2.18 2.18h1.656c.14 0 .234.031.344.14l1.172 1.172Zm.242-4.204a.883.883 0 0 1-.664-.28l-2.5-2.798a.778.778 0 0 1-.203-.531c0-.469.336-.805.82-.805.266 0 .461.086.633.274l1.883 2.101 3.765-5.375c.188-.265.39-.375.703-.375.485 0 .829.336.829.79a.936.936 0 0 1-.18.515l-4.383 6.148a.831.831 0 0 1-.703.336Z"
            />
          </svg>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-md font-bold">{username}</span>
          <p className={classNames("flex items-center gap-2", unread ? "text-white" : "text-gray-400")}>
            <span>You:</span>
            hello from dustinbrett.com
            <span>·</span>
            <span>42m</span>
          </p>
        </div>
        {unread && <Badge size={2} />}
        <Menu as="div" className="relative inline-block">
          <Menu.Button className="invisible rounded p-1 transition-all hover:bg-gray-700 group-focus-within:visible group-hover:visible">
            <svg
              fill="none"
              stroke="currentColor"
              width="24"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md border border-gray-600 bg-gray-800 text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${active ? "bg-gray-700" : ""} group flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm`}>
                      <ClipboardIcon className="h-6 w-6" />
                      <span>Copy npub</span>
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button className={`${active ? "bg-gray-700" : ""} group flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm`}>
                      <SpeakerXMarkIcon className="h-6 w-6" />
                      <span>Mute</span>
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${active ? "bg-red-500/20" : ""
                        } group flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-red-500`}
                    >
                      <TrashIcon className="h-6 w-6" />
                      <span>Delete</span>
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </Link>
  );
}
