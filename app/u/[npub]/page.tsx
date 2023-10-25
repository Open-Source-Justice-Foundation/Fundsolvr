"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { Profile } from "@/app/types";
import { PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/20/solid";
import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";

import Timeline from "./Timeline";

export default function UserProfilePage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfile, setProfile } = useProfileStore();

  const [publicKey, setpublicKey] = useState<string>("");

  const pathname = usePathname();
  let npub: string = "";
  if (pathname && pathname.length > 60) {
    npub = pathname.split("/").pop() || "";
  }

  useEffect(() => {
    if (npub) {
      const publicKey: any = nip19.decode(npub).data;
      setpublicKey(publicKey);

      if (getProfile(relayUrl, publicKey)) {
        return;
      }

      const onEvent = (event: Event) => {
        const profileContent = JSON.parse(event.content);

        const profile: Profile = {
          relay: relayUrl,
          publicKey: event.pubkey,
          about: profileContent.about,
          lud06: profileContent.lud06,
          lud16: profileContent.lud16,
          name: profileContent.name,
          nip05: profileContent.nip05,
          picture: profileContent.picture,
          banner: profileContent.banner,
          website: profileContent.website,
          github: profileContent.github,
          publicKeyGistId: profileContent.publicKeyGistId,
        };

        console.log("PROFILE", profile);

        setProfile(profile);
      };

      const onEOSE = () => {};

      const userFilter = {
        kinds: [0],
        authors: [publicKey],
      };

      subscribe([relayUrl], userFilter, onEvent, onEOSE);
    }
  }, [npub, relayUrl]);

  return (
    <div className="flex flex-col items-center justify-center px-4 pb-20 pt-10">
      <div className="flex w-full max-w-3xl flex-col gap-y-4">
        <div className="flex w-full items-center justify-between">
          <img
            className="h-28 w-28 cursor-pointer rounded-full ring-2 ring-white dark:ring-gray-300"
            src={getProfile(relayUrl, publicKey)?.picture}
          />
          <div className="flex gap-x-4">
            <Link
              className="flex items-center justify-center rounded-lg bg-gray-400 px-3 text-white hover:bg-gray-500 dark:bg-gray-700/80 dark:hover:bg-gray-700"
              href={`/messages/${nip19.npubEncode(getProfile(relayUrl, publicKey)?.publicKey || "")}`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Link>

            <button className="flex items-center gap-x-2 rounded-lg bg-indigo-500 px-4 py-2 text-lg text-gray-100 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500">
              <UserPlusIcon className="h-5 w-5" />
              Follow
            </button>
          </div>
        </div>

        <div className="flex w-full items-center gap-x-4">
          <div className="flex flex-col gap-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{getProfile(relayUrl, publicKey)?.name}</h2>
            <div className="flex items-center gap-x-2">
              {getProfile(relayUrl, publicKey)?.nip05 && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">{getProfile(relayUrl, publicKey)?.nip05}</span>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                </>
              )}
              <span className="text-gray-500 dark:text-gray-400">{getProfile(relayUrl, publicKey)?.lud16}</span>
            </div>
          </div>
        </div>

        <span className="max-w-sm break-words text-lg text-gray-700 dark:text-gray-100 md:max-w-xl">
          {getProfile(relayUrl, publicKey)?.about}
        </span>
        {getProfile(relayUrl, publicKey)?.github && (
          <div className="flex">
            <Link className="block h-7 w-7" href={`https://github.com/${getProfile(relayUrl, publicKey)?.github}`} target="_blank">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                  fill="#24292f"
                />
              </svg>
            </Link>
          </div>
        )}

        <Timeline />
      </div>
    </div>
  );
}
