import { Fragment, useEffect, useState } from "react";

import Link from "next/link";

import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Profile } from "@/app/types";
import { Popover, Transition } from "@headlessui/react";
import { nip19 } from "nostr-tools";

export default function UserMenu({ children }: any) {
  const { activeRelay, relayUrl } = useRelayStore();
  const { getUserProfile, clearUserProfile, setUserPublicKey, userPublicKey } = useUserProfileStore();
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
      <Popover.Button className="inline-flex items-center gap-x-2 text-sm font-semibold leading-6 outline-none ring-0">
        {children}
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
          <div className="dark:border-smoke-500 dark:bg-smoke-700 dark:text-smoke-50 w-48 shrink rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 py-2 text-sm font-semibold leading-6 text-gray-800 dark:text-gray-100 shadow-lg ring-1 ring-gray-200 dark:ring-gray-900/5">
            <Link key="profile" href={`/u/${nip19.npubEncode(userPublicKey)}`} className="block px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Profile
            </Link>
            <Link key="profile" href="/messages" className="block px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Messages
            </Link>
            <Link key="profile" href="/settings" className="block px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Settings
            </Link>
            <Link key="profile" href="/u/asdf" className="block px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Relays
            </Link>
            <div className="dark:border-smoke-500 mt-2 border-t border-gray-200 dark:border-gray-600" />
            <span onClick={signOut} className="mt-2 block cursor-pointer px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              <p>{"Sign out"}</p>
            </span>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
