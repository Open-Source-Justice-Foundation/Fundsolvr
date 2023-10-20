"use client";

import { useRouter } from "next/navigation";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { UserIcon } from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

import { getTagValues, removeMarkdownTitles, truncateText } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useProfileStore } from "../stores/profileStore";
import { useRelayStore } from "../stores/relayStore";

const statuses = {
  Open: "text-yellow-400 bg-yellow-400/10",
  Completed: "text-green-400 bg-green-400/10",
  Withdrawn: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes: Array<any>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  event: Event;
}

export default function Bounty({ event }: Props) {
  const { relayUrl } = useRelayStore();
  const { getProfile } = useProfileStore();
  const { setCachedBountyEvent } = useBountyEventStore();

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
        className="relative flex w-full cursor-pointer flex-col gap-y-4 rounded-lg border border-gray-500/30 bg-gray-800 py-4 pr-4 transition duration-150 ease-in-out hover:border-gray-500/60"
        onClick={routeBounty}
      >
        <div className="flex justify-between pl-1.5">
          <div className="flex text-2xl text-bitcoin">
            <SatoshiV2Icon style={{ height: "2rem", width: "2rem" }} />
            {Number(getTagValues("value", event.tags)).toLocaleString()}
          </div>

          <div className="flex items-center justify-end gap-x-2 sm:justify-start">
            {/*@ts-ignore*/}
            {/*TODO: get status from event*/}
            <div className={classNames(statuses["Open"], "flex-none rounded-full p-1")}>
              <div className="h-1.5 w-1.5 rounded-full bg-current" />
            </div>
            <div className="hidden text-white sm:block">{"Open"}</div>
          </div>
        </div>

        <div className="flex flex-col gap-x-3 gap-y-4 pl-4">
          <div className="leading-6 text-gray-100">{getTagValues("title", event.tags)}</div>
          <div className="leading-6 text-gray-100">{truncateText(removeMarkdownTitles(event.content), 120)}</div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-x-2 pl-4 text-gray-400">
            <img
              src={getProfile(relayUrl, event.pubkey)?.picture}
              alt=""
              className="h-8 w-8 rounded-full bg-gray-800 ring-1 ring-gray-700"
            />
            <div className="truncate text-sm font-medium leading-6 ">{getProfile(relayUrl, event.pubkey)?.name}</div>
            <span>•</span>
            <div className="text-sm leading-6">
              <time>{new Date(event.created_at * 1000).toDateString()}</time>
            </div>
          </div>
          <div className="text-gray-400 flex items-center gap-x-2 text-sm leading-6">
            <UserIcon className="h-4 w-4 " aria-hidden="true" />
            <span>2 Applicants</span>
          </div>
        </div>
      </li>
    </>
  );
}
