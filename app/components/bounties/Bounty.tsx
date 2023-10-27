"use client";

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

interface Props {
  event: Event;
}

export default function Bounty({ event }: Props) {
  const { relayUrl } = useRelayStore();
  const { getProfileEvent } = useProfileStore();
  const { setCachedBountyEvent, getBountyApplicants } = useBountyEventStore();
  const { getUserPublicKey } = useUserProfileStore();
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
        className="relative flex w-full cursor-pointer flex-col gap-y-4 rounded-lg border border-gray-200 bg-white py-4 pr-4 shadow-lg shadow-black/10 transition duration-150 ease-in-out hover:border-gray-400/70 dark:border-gray-500/30 dark:bg-gray-800/80 dark:hover:border-gray-500/60"
        onClick={routeBounty}
      >
        <div className="flex justify-between pl-1.5">
          <div className="flex text-2xl text-bitcoin">
            <SatoshiV2Icon style={{ height: "2rem", width: "2rem" }} />
            {Number(getTagValues("reward", event.tags)).toLocaleString()}
          </div>

          <div className="flex items-center justify-end gap-x-2 sm:justify-start">
            {/* {event.pubkey === getUserPublicKey() && <DeleteBounty eventId={event.id}></DeleteBounty>} */}
            {tags[0] && (
              <div
                key={tags[0]}
                className="flex cursor-pointer select-none items-center gap-x-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-100"
              >
                {tags[0]}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-x-3 gap-y-4 pl-4">
          <div className="font-bold leading-6 text-gray-800 dark:text-gray-100">{getTagValues("title", event.tags)}</div>
          <div className="prose leading-6 text-gray-800 dark:text-gray-100">{truncateText(removeMarkdownTitles(event.content), 120)}</div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2 pl-4 text-gray-700 dark:text-gray-400">
            <Avatar
              src={parseProfileContent(getProfileEvent(relayUrl, event.pubkey)?.content).picture}
              className="h-8 w-8 ring-1 ring-white dark:ring-gray-700"
              seed={event.pubkey}
            />
            <div className="truncate text-sm font-medium leading-6 ">
              {parseProfileContent(getProfileEvent(relayUrl, event.pubkey)?.content).name || shortenHash(nip19.npubEncode(event.pubkey))}
            </div>
            <span>•</span>
            <div className="text-sm leading-6">
              <time>{new Date(event.created_at * 1000).toDateString()}</time>
            </div>
          </div>
          <div className="hidden items-center gap-x-2 text-sm leading-6 text-gray-700 dark:text-gray-400 sm:flex">
            <UserIcon className="h-4 w-4 " aria-hidden="true" />
            <span>{Object.keys(getBountyApplicants(relayUrl, getTagValues("d", event.tags))).length} Applicants</span>
          </div>
        </div>
      </li>
    </>
  );
}
