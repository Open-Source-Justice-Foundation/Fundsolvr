"use client";

import { Fragment } from "react";

import { classNames } from "@/app/lib/utils";
import { Menu, Transition } from "@headlessui/react";
import { ClipboardIcon, SpeakerXMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

interface IContactMenuButtonProps {
  className?: string;
}

const ContactMenuButton = ({ className = "" }: IContactMenuButtonProps) => {
  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className={classNames(
          className,
          "rounded p-1 transition-all hover:bg-gray-50 group-focus-within:visible group-hover:visible dark:hover:bg-gray-700"
        )}
      >
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-200 rounded-md border border-gray-200 bg-white text-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-600 dark:border-darkBorder dark:bg-gray-800 dark:text-white">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100 dark:bg-darkFormFieldBackground" : ""
                  } group flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm`}
                >
                  <ClipboardIcon className="h-6 w-6" />
                  <span>Copy npub</span>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-100 dark:bg-darkFormFieldBackground" : ""
                  } group flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm`}
                >
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
                  className={`${
                    active ? "bg-red-500/20" : ""
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
  );
};

export default ContactMenuButton;
