"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { UserIcon } from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

import { getBountyTags, getTagValues, parseProfileContent, removeMarkdownTitles, shortenHash, truncateText } from "../../lib/utils";
import Avatar from "../../messages/components/Avatar";
import { useBountyEventStore } from "../../stores/eventStore";
import { useProfileStore } from "../../stores/profileStore";
import { useRelayStore } from "../../stores/relayStore";
import BitcoinIcon from "../icons/BitcoinIcon";

interface Props {
  event: Event;
}

export default function Bounty({ event }: Props) {
  const { relayUrl } = useRelayStore();
  const { getProfileEvent } = useProfileStore();
  const { setCachedBountyEvent, getBountyApplicants } = useBountyEventStore();
  const tags = getBountyTags(event.tags);

  const router = useRouter();

  const routeBounty = () => {
    const identifier = getTagValues("d", event.tags);

    // TODO: handle relays
    // TODO: add tag for applicacants
    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: event.pubkey,
      kind: 30050,
      relays: [relayUrl],
    };

    setCachedBountyEvent(event);
    router.push("/b/" + nip19.naddrEncode(addressPointer));
  };

  return (
    <>
      <style>
        {`
          .group:hover .group-hover-underline {
            text-decoration: underline;
          }
        `}
      </style>
      <li
        key={event.id}
        className="relative flex w-full cursor-pointer flex-col gap-x-4 border-t border-gray-200 p-4 transition duration-150 ease-in-out hover:bg-white dark:border-gray-500/30 dark:hover:border-gray-500/60 dark:hover:bg-gray-800/80 sm:flex-row"
        onClick={routeBounty}
      >
        <div className="order-last mt-2 flex items-center justify-start sm:order-first sm:mt-0 sm:justify-center">
          <Avatar
            src={parseProfileContent(getProfileEvent(relayUrl, event.pubkey)?.content).picture}
            className="h-14 w-14 rounded-sm ring-1 ring-white dark:ring-gray-700"
            seed={event.pubkey}
          />
        </div>
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex flex-col gap-x-3 gap-y-2">
            <div className="flex flex-row items-center text-secondaryText">
              <div className="truncate text-sm font-medium leading-6 ">
                {parseProfileContent(getProfileEvent(relayUrl, event.pubkey)?.content).name || shortenHash(nip19.npubEncode(event.pubkey))}
              </div>
              <div className="flex items-center justify-center stroke-secondaryText">
                {" "}
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                  <path d="M4.58081 3L7.58081 6L4.58081 9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>{" "}
              </div>

              <div className="text-sm leading-6">{getTagValues("title", event.tags)}</div>
              <div className="ml-auto hidden justify-between sm:flex">
                <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                  {/* {event.pubkey === getUserPublicKey() && <DeleteBounty eventId={event.id}></DeleteBounty>} */}
                  {tags[0] && (
                    <div
                      key={tags[0]}
                      className="flex cursor-pointer select-none items-center gap-x-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-500 dark:bg-darkFormFieldBackground dark:text-gray-100"
                    >
                      {tags[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="prose leading-6 text-gray-800 dark:text-gray-100">{truncateText(removeMarkdownTitles(event.content), 120)}</div>
          </div>
          <div className="flex items-center font-lexend text-1.25 font-semibold text-bitcoin">
            <BitcoinIcon />
            {Number(getTagValues("reward", event.tags)).toLocaleString()}
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-x-2 text-gray-700 dark:text-gray-400">
              <div className="text-sm leading-6">
                <time>{new Date(event.created_at * 1000).toDateString()}</time>
              </div>
            </div>
            <div className="hidden items-center gap-x-2 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:flex">
              <UserIcon className="h-4 w-4 " aria-hidden="true" />
              <span>{Object.keys(getBountyApplicants(relayUrl, getTagValues("d", event.tags))).length} Applicants</span>
            </div>
          </div>
        </div>
      </li>
    </>
  );
}
