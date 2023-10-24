import { Fragment, useEffect, useState } from "react";

import Link from "next/link";

import { useRelayInfoStore } from "@/app/stores/relayInfoStore";
import { useRelayMenuStore } from "@/app/stores/relayMenuStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Profile } from "@/app/types";
import { Popover, Transition } from "@headlessui/react";
import { nip19 } from "nostr-tools";

export default function Example({ children }: any) {
  const { activeRelay, relayUrl } = useRelayStore();
  const { getUserProfile, setUserProfile, userProfile, userPublicKey, clearUserProfile, setUserPublicKey } = useUserProfileStore();
  const [currentProfile, setCurrentProfile] = useState<Profile>();
  const { getRelayInfo } = useRelayInfoStore();
  const { setRelayMenuActiveTab, setRelayMenuIsOpen } = useRelayMenuStore();

  useEffect(() => {
    if (currentProfile && currentProfile.relay === relayUrl) {
      return;
    }
    const cachedProfile = getUserProfile(relayUrl);

    if (cachedProfile) {
      setCurrentProfile(cachedProfile);
      return;
    }
  }, [relayUrl, activeRelay, userProfile]);

  const handleRelayMenuSettingsClick = () => {
    setRelayMenuActiveTab("Settings");
    setRelayMenuIsOpen(true);
    console.log("RelayMenuSettings");
  };

  const handleRelayMenuReadFromClick = () => {
    setRelayMenuActiveTab("Read From");
    setRelayMenuIsOpen(true);
  };

  const signOut = async () => {
    clearUserProfile();
    setUserPublicKey("");
  };

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 outline-none ring-0">
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
          <div className="w-48 shrink rounded-md border border-gray-200 bg-gray-50 py-2 text-sm font-semibold leading-6 text-gray-800 shadow-lg ring-1 ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-900/5">
            <span
              onClick={handleRelayMenuReadFromClick}
              className="mb-2 block cursor-pointer border-b border-gray-200  px-4 pb-2 pt-1 dark:border-gray-700/40"
            >
              {currentProfile && currentProfile.name && <p>{currentProfile.name}</p>}
              {currentProfile && currentProfile.name && (
                <p className="mb-1 mt-2 flex items-center gap-x-2">
                  <img
                    className="h-5 w-5 rounded-full"
                    src={relayUrl.replace("wss://", "https://").replace("relay.", "") + "/favicon.ico"}
                    alt=""
                  />
                  {getRelayInfo(relayUrl) && <span className="text-gray-500 dark:text-gray-200">{getRelayInfo(relayUrl).name}</span>}
                </p>
              )}
            </span>
            <Link
              href={`/u/${nip19.npubEncode(userPublicKey)}`}
              className="block select-none px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600"
            >
              Profile
            </Link>
            <Link href="/messages" className="block select-none px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Messages
            </Link>
            <Link href="/settings" className="block select-none px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              Settings
            </Link>

            {/* TODO: close menu when this is clicked */}
            <span
              className="block cursor-pointer select-none px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600"
              onClick={handleRelayMenuReadFromClick}
            >
              Relays
            </span>
            <div className="mt-2 border-t border-gray-200 dark:border-gray-700/40" />
            <span onClick={signOut} className="mt-2 block cursor-pointer px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600">
              <p>{"Sign out"}</p>
            </span>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
