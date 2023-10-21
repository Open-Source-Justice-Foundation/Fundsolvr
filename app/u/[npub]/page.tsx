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

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfile, setProfile } = useProfileStore();

  const [publicKey, setpublicKey] = useState<string>("");

  const pathname = usePathname();
  let npub: string = "";
  if (pathname && pathname.length > 60) {
    npub = pathname.split("/").pop() || "";
    console.log("npub", npub);
  }

  useEffect(() => {
    if (npub) {
      const publicKey: any = nip19.decode(npub).data;
      console.log("npub_data", publicKey);
      setpublicKey(publicKey);

      if (getProfile(relayUrl, publicKey)) {
        console.log("cached profile", getProfile(relayUrl, publicKey));
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
        console.log("profile", profile);

        setProfile(profile);
      };

      const onEOSE = () => { };

      const userFilter = {
        kinds: [0],
        authors: [publicKey],
      };

      subscribe([relayUrl], userFilter, onEvent, onEOSE);
    }
  }, [npub]);

  return (
    <div className="flex flex-col items-center justify-center px-4 pb-20 pt-10">
      <div className="flex w-full max-w-3xl flex-col gap-y-4">
        <div className="flex w-full items-center justify-between">
          <img className="h-28 w-28 cursor-pointer rounded-full ring-2 ring-gray-300" src={getProfile(relayUrl, publicKey)?.picture} />
          <div className="flex gap-x-4">
            <Link
              className="flex items-center justify-center rounded-lg bg-gray-700/80 px-3 text-white hover:bg-gray-700"
              href={`/messages/${nip19.npubEncode(getProfile(relayUrl, publicKey)?.publicKey || "")}`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Link>

            <button className="flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-lg text-gray-100 hover:bg-indigo-500">
              <UserPlusIcon className="h-5 w-5" />
              Follow
            </button>
          </div>
        </div>

        <div className="flex w-full items-center gap-x-4">
          <div className="flex flex-col gap-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">{getProfile(relayUrl, publicKey)?.name}</h2>
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

        <span className="max-w-sm break-words text-lg text-gray-100 md:max-w-xl">{getProfile(relayUrl, publicKey)?.about}</span>

        <Timeline />
      </div>
    </div>
  );
}
