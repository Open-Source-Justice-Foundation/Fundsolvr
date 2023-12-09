"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import BountyPlaceholder from "@/app/components/Skeleton/Bounty";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { Event, Filter } from "nostr-tools";
import { nip19 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";

import { BountyTab } from "../../lib/constants";
import { filterBounties, getApplicants, retrieveProfiles } from "../../lib/nostr";
import { getTagValues } from "../../lib/utils";
import { useBountyEventStore } from "../../stores/eventStore";
import { useRelayStore } from "../../stores/relayStore";
import { useUserProfileStore } from "../../stores/userProfileStore";
import Bounty from "./Bounty";
import LoadBountiesButton from "./LoadBountiesButton";
import NoBounties from "./NoBounties";

export default function Bounties() {
  const { subscribe, relayUrl } = useRelayStore();
  const { setAssignedEvents, bountyEvents, bountyType, search } = useBountyEventStore();
  const [disputedBounties, setDisputedBounties] = useState<{ bounty: Event; poll: Event }[]>([]);
  const { userPublicKey } = useUserProfileStore();
  const [loading, setLoading] = useState({ disputed: false });

  const getDisputedBounties = async () => {
    setLoading({ ...loading, disputed: true });

    const events: Event[] = [];
    const pubkeys = new Set<string>();
    const dValues = new Set<string>();

    const pollEventFilter: Filter = {
      kinds: [6969],
      limit: 10,
      until: undefined,
      "#L": ["io.resolvr"],
    };

    if (bountyEvents[relayUrl]) {
      const lastEvent = bountyEvents[relayUrl].slice(-1)[0];
      if (lastEvent) {
        pollEventFilter.until = lastEvent.created_at - 10;
      }
    }

    const onEvent = (event: Event) => {
      events.push(event);
      console.log(event);
    };

    const onEOSE = () => {
      const pollToBountyMap: { bounty: Event; poll: Event }[] = [];
      console.log(events);
      events.forEach((event) => {
        const bountyId = event.tags.find((t) => {
          if (t[0] === "e") {
            return t;
          }
        });

        if (bountyId) {
          const disputedBountyFilter: Filter = {
            kinds: [30050],
            ids: [bountyId[1]],
          };

          subscribe(
            [relayUrl],
            disputedBountyFilter,
            (bounty) => {
              pollToBountyMap.push({
                bounty,
                poll: event,
              });
              console.log("disputed bounty event!", bounty);
            },
            () => {
              console.log("disputed bounties", pollToBountyMap);
              setDisputedBounties(pollToBountyMap);
            }
          );
        }
      });

      // setDisputedBounties(pollToBountyMap);
      setLoading({ ...loading, disputed: false });
    };

    subscribe([relayUrl], pollEventFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (userPublicKey) {
      getDisputedBounties();
    }
  }, [userPublicKey, relayUrl]);

  return (
    <>
      {loading.disputed
        ? Array.from(Array(5)).map((i) => <BountyPlaceholder key={i} />)
        : bountyType === BountyTab.disputed &&
          disputedBounties &&
          userPublicKey &&
          (disputedBounties.length ? (
            disputedBounties.map((e) => {
              const poll: EventPointer = {
                id: e.poll.id,
                author: e.poll.pubkey,
                kind: 6969,
                relays: [relayUrl],
              };
              return (
                <>
                  <Bounty key={e.bounty.id} event={e.bounty} />
                  <div className="bottom-1 mb-2 mt-4 flex w-full items-center  border-b border-gray-500 py-4">
                    <Link
                      href={`/poll/${nip19.neventEncode(poll)}`}
                      className="align-start ml-auto flex items-center gap-x-2 self-start hover:text-gray-700 dark:text-white hover:dark:text-gray-400"
                    >
                      <span>Go to Poll</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              );
            })
          ) : (
            <NoBounties />
          ))}
      <LoadBountiesButton action={getDisputedBounties} />
    </>
  );
}
