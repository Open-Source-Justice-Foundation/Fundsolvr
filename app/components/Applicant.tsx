"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { type Event, nip19 } from "nostr-tools";

import { getITagValue, getITagValues, getTagValues, parseProfileContent, verifyGithub, websiteLink } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useProfileStore } from "../stores/profileStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import AssignButton from "./AssignButton";
import UnassignButton from "./UnassignButton";

interface Props {
  applicantEvent: Event;
}

export default function Applicant({ applicantEvent }: Props) {
  // console.log("applicantEvent", applicantEvent);

  const { relayUrl, subscribe } = useRelayStore();
  const { getProfileEvent, setProfileEvent } = useProfileStore();
  const { userPublicKey } = useUserProfileStore();
  const { cachedBountyEvent } = useBountyEventStore();

  const [githubVerified, setGithubVerified] = useState(false);

  async function verifyGithubForUser(tag: any) {
    const githubUserVerified = await verifyGithub(nip19.npubEncode(applicantEvent.pubkey), tag[2]);
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
    if (getProfileEvent(relayUrl, applicantEvent.pubkey)) {
      const github = getITagValue(getProfileEvent(relayUrl, applicantEvent.pubkey)?.tags, "github");
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
      authors: [applicantEvent.pubkey],
    };

    subscribe([relayUrl], userFilter, onEvent, onEOSE);
  }, [relayUrl]);

  useEffect(() => {
    console.log("CACHEDBOUNTYEVENT!!!!!", cachedBountyEvent);
    // console.log("userPublicKey", userPublicKey);
    // console.log("applicantEvent", applicantEvent);
  }, [cachedBountyEvent]);

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-4 dark:bg-gray-800">
      <div className="flex flex-col gap-y-6">
        <Link href={`/u/${nip19.npubEncode(applicantEvent.pubkey)}`} className="flex cursor-pointer items-center gap-x-3">
          <img
            src={parseProfileContent(getProfileEvent(relayUrl, applicantEvent.pubkey)?.content).picture}
            alt=""
            className="h-8 w-8 rounded-full"
          />
          <span className="font-medium leading-6 text-gray-900 dark:text-gray-100">
            {parseProfileContent(getProfileEvent(relayUrl, applicantEvent.pubkey)?.content).name}
          </span>
        </Link>
        <span className="flex gap-x-1 text-sm leading-6 text-gray-900 dark:text-gray-400">
          <span>Applied</span>
          {new Date(getProfileEvent(relayUrl, applicantEvent.pubkey)?.created_at * 1000).toLocaleDateString("en-Us", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="text-gray-900 dark:text-gray-300">{getTagValues("message", applicantEvent.tags)}</span>

        <div className="flex gap-x-4">
          {parseProfileContent(getProfileEvent(relayUrl, applicantEvent.pubkey)?.content).website && (
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href={websiteLink(parseProfileContent(getProfileEvent(relayUrl, applicantEvent.pubkey)?.content).website)}
              className="relative flex items-center gap-x-2 rounded-lg bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:dark:bg-gray-600"
            >
              <svg
                className="h-5 w-5 fill-gray-700 hover:fill-gray-500 dark:fill-gray-200 dark:hover:fill-gray-200"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
              </svg>
              Website
            </a>
          )}

          {githubVerified && (
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href={`https://github.com/${getITagValue(getProfileEvent(relayUrl, applicantEvent.pubkey)?.tags, "github")}`}
              className="relative flex items-center gap-x-2 rounded-lg bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:dark:bg-gray-600"
            >
              <svg
                className="h-5 w-5 fill-gray-700 hover:fill-gray-500 dark:fill-gray-200 dark:hover:fill-gray-200"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
              GitHub
              <span className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-gray-100 dark:bg-green-400 dark:ring-gray-900">
                <CheckCircleIcon className="h-full w-full text-gray-100 dark:text-gray-900" />
              </span>
            </a>
          )}
        </div>
      </div>
      {cachedBountyEvent &&
        getTagValues("p", cachedBountyEvent.tags) === applicantEvent.pubkey &&
        cachedBountyEvent.pubkey !== userPublicKey && <span className="text-green-500 dark:text-green-400">Assigned</span>}
      {cachedBountyEvent &&
        getTagValues("p", cachedBountyEvent.tags) === applicantEvent.pubkey &&
        cachedBountyEvent.pubkey === userPublicKey && <UnassignButton />}
      {cachedBountyEvent &&
        getTagValues("p", applicantEvent.tags) === userPublicKey &&
        getTagValues("p", cachedBountyEvent.tags) !== applicantEvent.pubkey &&
        !getTagValues("p", cachedBountyEvent.tags) && <AssignButton pubkey={applicantEvent.pubkey} />}
    </div>
  );
}
