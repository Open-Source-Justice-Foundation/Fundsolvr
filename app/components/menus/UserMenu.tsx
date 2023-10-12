import { Fragment, useEffect, useState } from "react";

import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Profile } from "@/app/types";
import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";


const links = [
  { name: "Profile", href: "#" },
  { name: "Your Notes", href: "#" },
  { name: "Bookmarked Notes", href: "#" },
  // create faq page later https://github.com/vercel/next.js/discussions/17443
  // { name: "Help", href: "#" },
];

export default function UserMenu({ children }: any) {
  const { activeRelay, relayUrl } = useRelayStore();
  const { getUserProfile, clearUserProfile, setUserPublicKey } = useUserProfileStore();
  const [currentProfile, setCurrentProfile] = useState<Profile>();
  useEffect(() => {
    if (currentProfile && currentProfile.relay === relayUrl) {
      return;
    }
    const cachedProfile = getUserProfile(relayUrl);

    if (cachedProfile) {
      setCurrentProfile(cachedProfile);
      return;
    }
  }, [relayUrl, activeRelay]);

  const signOut = async () => {
    clearUserProfile();
    setUserPublicKey("");
  };

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-2 text-sm font-semibold leading-6 text-gray-900 outline-none ring-0">
        {children}
        {/* <ChevronDownIcon className="mt-2 h-6 w-6 text-gray-300" aria-hidden="true" /> */}
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-10 mt-2 flex w-screen max-w-min translate-x-4 px-4">
          <div className="w-48 shrink rounded-md border border-gray-600 bg-gray-800 py-2 text-sm font-semibold leading-6 text-gray-100 shadow-lg ring-1 ring-gray-900/5 dark:border-smoke-500 dark:bg-smoke-700 dark:text-smoke-50">
            {links.map((item) => (
              <a key={item.name} href={item.href} className="block px-4 py-1 hover:bg-blue-600 dark:hover:bg-blue-600">
                {item.name}
              </a>
            ))}
            <div className="mt-2 border-t border-gray-600 dark:border-smoke-500" />
            <span onClick={signOut} className="mt-2 block cursor-pointer px-4 py-1 hover:bg-blue-600 dark:hover:bg-blue-600">
              <p>{"Sign out"}</p>
            </span>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
