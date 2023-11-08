import { Fragment, useEffect, useState } from "react";

import Link from "next/link";

import { shortenHash } from "@/app/lib/utils";
import { useRelayInfoStore } from "@/app/stores/relayInfoStore";
import { useRelayMenuStore } from "@/app/stores/relayMenuStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Profile } from "@/app/types";
import { Popover, Transition } from "@headlessui/react";
import { getPublicKey, nip19 } from "nostr-tools";

export default function Example({ children }: any) {
  const { relayUrl } = useRelayStore();
  const { getUserProfile, setUserProfile, userProfile, userPublicKey, clearUserProfile, setUserPublicKey, setUserPrivateKey } =
    useUserProfileStore();
  const [currentProfile, setCurrentProfile] = useState<Profile>();
  const { getRelayInfo } = useRelayInfoStore();
  const { setRelayMenuActiveTab, setRelayMenuIsOpen } = useRelayMenuStore();

  useEffect(() => {
    const cachedProfile = getUserProfile(relayUrl);

    if (cachedProfile) {
      setCurrentProfile(cachedProfile);
      return;
    }
  }, [relayUrl, userProfile]);

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
    setUserPrivateKey("");
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
              {currentProfile && currentProfile.name ? <p>{currentProfile.name}</p> : <p>{shortenHash(nip19.npubEncode(userPublicKey))}</p>}
              {currentProfile && (
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
            {[
              {
                href: `/u/${nip19.npubEncode(userPublicKey)}`,
                label: "Profile",
              },
              {
                href: "/messages",
                label: "Messages",
              },
              {
                href: "/settings",
                label: "Settings",
              },
            ].map(({ href, label }, idx) => (
              <Popover.Button
                key={idx}
                as={Link}
                href={href}
                className="block select-none px-4 py-1 hover:bg-indigo-200 dark:hover:bg-indigo-600"
              >
                {label}
              </Popover.Button>
            ))}

            <Popover.Button
              as="button"
              className="block w-full cursor-pointer select-none px-4 py-1 text-left hover:bg-indigo-200 dark:hover:bg-indigo-600"
              onClick={handleRelayMenuReadFromClick}
            >
              Relays
            </Popover.Button>
            <div className="mt-2 border-t border-gray-200 dark:border-gray-700/40" />
            <Popover.Button
              as="button"
              onClick={signOut}
              className="mt-2 block w-full cursor-pointer px-4 py-1 text-left hover:bg-indigo-200 dark:hover:bg-indigo-600"
            >
              <p>{"Sign out"}</p>
            </Popover.Button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
