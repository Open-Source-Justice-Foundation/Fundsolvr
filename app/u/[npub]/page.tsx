"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getITagValue, getITagValues, parseProfileContent, shortenHash, verifyGithub, websiteLink } from "@/app/lib/utils";
import Avatar from "@/app/messages/components/Avatar";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { CheckCircleIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/20/solid";
import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";

import Timeline from "./Timeline";

export default function UserProfilePage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfileEvent, setProfileEvent } = useProfileStore();

  const [publicKey, setpublicKey] = useState<string>("");
  const [githubVerified, setGithubVerified] = useState(false);

  const pathname = usePathname();
  let npub: string = "";
  if (pathname && pathname.length > 60) {
    npub = pathname.split("/").pop() || "";
  }

  // check if github profile exists

  async function verifyGithubForUser(tag: any) {
    const githubUserVerified = await verifyGithub(npub, tag[2]);
    if (githubUserVerified) {
      setGithubVerified(true);
      return tag[1];
    } else {
      return "";
    }
  }

  async function setupProfile(event: any) {
    let github = "";
    const iTags = getITagValues(event.tags);

    for (let tag of iTags) {
      if (tag[0] === "github") {
        github = await verifyGithubForUser(tag);
        break;
      }
    }

    setProfileEvent(relayUrl, event.pubkey, event);
  }

  useEffect(() => {
    if (npub) {
      const publicKey: any = nip19.decode(npub).data;
      setpublicKey(publicKey);

      if (getProfileEvent(relayUrl, publicKey)) {
        const github = getITagValue(getProfileEvent(relayUrl, publicKey)?.tags, "github");
        if (github) {
          setGithubVerified(true);
        }
        return;
      }

      const onEvent = (event: Event) => {
        setupProfile(event);
      };

      const onEOSE = () => { };

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
          <Avatar
            className="h-28 w-28 cursor-pointer ring-2 ring-white dark:ring-gray-300"
            src={parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).picture}
            seed={publicKey}
          />
          <div className="flex gap-x-4">
            <Link
              className="flex items-center justify-center rounded-lg bg-gray-400 px-3 text-white hover:bg-gray-500 dark:bg-gray-700/80 dark:hover:bg-gray-700"
              href={`/messages/${nip19.npubEncode(publicKey)}`}
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).name || shortenHash(nip19.npubEncode(publicKey))}
            </h2>
            <div className="flex items-center gap-x-2">
              {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).nip05 && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">
                    {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).nip05}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                </>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).lud16}
              </span>
            </div>
          </div>
        </div>

        <span className="max-w-sm break-words text-lg text-gray-700 dark:text-gray-100 md:max-w-xl">
          {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).about}
        </span>

        <div className="flex gap-x-4">
          {parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).website && (
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href={websiteLink(parseProfileContent(getProfileEvent(relayUrl, publicKey)?.content).website)}
              className="relative inline-block"
            >
              <svg
                className="h-8 w-8 fill-gray-400 hover:fill-gray-500 dark:hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
              </svg>
            </a>
          )}
          {githubVerified && (
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href={`https://github.com/${getITagValue(getProfileEvent(relayUrl, publicKey)?.tags, "github")}`}
              className="relative inline-block"
            >
              <svg
                className="h-8 w-8 fill-gray-400 hover:fill-gray-500 dark:hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-gray-100 dark:bg-green-400 dark:ring-gray-900">
                <CheckCircleIcon className="h-full w-full text-gray-100 dark:text-gray-900" />
              </span>
            </a>
          )}
        </div>

        <Timeline />
      </div>
    </div>
  );
}
