import React, { useEffect } from "react";

import { getTagValues, removeTag } from "@/app/lib/utils";
import { useRelayStore } from "@/app/stores/relayStore";
import { BitcoinCircleIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { IdentificationIcon, NewspaperIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline";
import { type Event, Filter, Relay, nip19 } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

interface Props {
  event: Event;
  eventIdx: number;
  timelineLength: number;
}

export default function TimelineItem({ event, eventIdx, timelineLength }: Props) {
  const { relayUrl } = useRelayStore();

  async function getZapReceipt(event: Event) {
    const messageFilter: Filter = {
      kinds: [9735],
      limit: 1,
      "#e": [event.id],
    };

    const relay: Relay = await useRelayStore.getState().connect(relayUrl);

    const zapReceiptEvent = await relay.get(messageFilter);

    console.log("zap receipt", zapReceiptEvent);

    if (zapReceiptEvent) {
      let tags = removeTag("s", event.tags);
      const status = ["s", "paid"];
      tags.push(status);
      event.tags = tags;
    }

    return zapReceiptEvent;
  }

  useEffect(() => {
    if (event.kind === 30050 && getTagValues("s", event.tags) === "assigned") {
      getZapReceipt(event);
    }
  }, [relayUrl]);

  function getBountyTitle(event: Event) {
    const bountyDescription = getTagValues("description", event.tags);
    const bountyEvent = JSON.parse(bountyDescription);
    return getTagValues("title", bountyEvent.tags);
  }

  function getBountyFromDescription(event: Event) {
    const bountyDescription = getTagValues("description", event.tags);
    const bountyEvent = JSON.parse(bountyDescription);
    return bountyEvent;
  }

  function parseBountyNaddr(bountyEvent: Event) {
    const addressPointer: AddressPointer = {
      identifier: getTagValues("d", bountyEvent.tags),
      kind: 30050,
      pubkey: bountyEvent.pubkey,
    };
    return nip19.naddrEncode(addressPointer);
  }

  function parseBlogNaddr(bountyEvent: Event) {
    const addressPointer: AddressPointer = {
      identifier: getTagValues("d", bountyEvent.tags),
      kind: 30023,
      pubkey: bountyEvent.pubkey,
    };
    return nip19.naddrEncode(addressPointer);
  }

  return (
    <li key={event.id}>
      <div className="relative pb-8">
        {eventIdx !== timelineLength - 1 ? (
          <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-darkFormFieldBackground" aria-hidden="true" />
        ) : null}
        <div className="relative flex space-x-3">
          <div>
            {event.kind === 30023 && (
              <span className={"flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 ring-8 ring-white dark:ring-gray-900"}>
                <PencilSquareIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
            {event.kind === 8050 && (
              <span className={"flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 ring-8 ring-white dark:ring-gray-900"}>
                <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
            {event.kind === 30050 && getTagValues("s", event.tags) === "open" && (
              <span className={"flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white dark:ring-gray-900"}>
                <NewspaperIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
            {event.kind === 30050 && getTagValues("s", event.tags) === "assigned" && (
              <span className={"flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500 ring-8 ring-white dark:ring-gray-900"}>
                <IdentificationIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
            {event.kind === 30050 && getTagValues("s", event.tags) === "paid" && (
              <span className={"flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white dark:ring-gray-900"}>
                <BitcoinCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
            <div>
              <p className="flex gap-x-2 text-sm text-gray-500 dark:text-gray-400">
                {event.kind === 8050 && (
                  <>
                    <span className="">Applied to</span>
                    <a
                      href={`/b/${parseBountyNaddr(getBountyFromDescription(event))}`}
                      className="font-medium text-gray-900 dark:text-gray-200"
                    >
                      {getTagValues("title", getBountyFromDescription(event).tags)}
                    </a>
                  </>
                )}
                {event.kind === 30050 && (
                  <>
                    {getTagValues("s", event.tags) === "open" && <span className="">Posted</span>}
                    {getTagValues("s", event.tags) === "assigned" && <span className="">Assigned</span>}
                    {getTagValues("s", event.tags) === "paid" && <span className="">Paid</span>}
                    <a href={`/b/${parseBountyNaddr(event)}`} className="font-medium text-gray-900 dark:text-gray-200">
                      {getTagValues("title", event.tags)}
                    </a>
                  </>
                )}
                {event.kind === 30023 && (
                  <>
                    {<span className="">Wrote</span>}
                    <a href={`https://blogstack.io/${parseBlogNaddr(event)}`} className="font-medium text-gray-900 dark:text-gray-200">
                      {getTagValues("title", event.tags)}
                    </a>
                  </>
                )}
              </p>
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              <time dateTime={String(event.created_at)}>
                {new Date(event.created_at * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
