"use client";

import { useEffect, useState } from "react";

import BountyPlaceholder from "@/app/components/Skeleton/Bounty";
import type { Event, Filter } from "nostr-tools";

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
  const { setAssignedEvents, assignedEvents, bountyType, search } = useBountyEventStore();
  const [disputedBounties, setDisputedBounties] = useState<Event[]>([]);
  const { userPublicKey } = useUserProfileStore();
  const [loading, setLoading] = useState({ disputed: false });

  // TODO: check if user has been paid for bounty
  // if so don't show it
  const getAssignedBounties = async () => {
    if (userPublicKey && !assignedEvents[relayUrl]) {
      setLoading({ ...loading, disputed: true });
    }

    const events: Event[] = [];
    const pubkeys = new Set<string>();
    const dValues = new Set<string>();

    const pollEventFilter: Filter = {
      kinds: [1985],
      limit: 10,
      until: undefined,
      "#L": ["io.resolvr"],
    };

    if (assignedEvents[relayUrl]) {
      const lastEvent = assignedEvents[relayUrl].slice(-1)[0];
      if (lastEvent) {
        pollEventFilter.until = lastEvent.created_at - 10;
      }
    }

    const onEvent = (event: Event) => {
      events.push(event);
    };

    const onEOSE = () => {
      const disputedBounties: Event[] = [];

      events.forEach((event) => {
        const bountyId = event.tags.find((t) => {
          if (t[2] === "#t") {
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
            (e) => {
              console.log("disputed bounty event!", e);
              setDisputedBounties(disputedBounties.concat(e));
            },
            () => {
              console.log("disputed bounties", disputedBounties);
            }
          );
        }
      });

      setDisputedBounties(events);
      retrieveProfiles(Array.from(pubkeys));
      // getApplicants(dValues);
      setLoading({ ...loading, disputed: false });
    };

    subscribe([relayUrl], pollEventFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (userPublicKey) {
      getAssignedBounties();
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
            filterBounties(search, disputedBounties).map((event) => <Bounty key={event.id} event={event} />)
          ) : (
            <NoBounties />
          ))}
      <LoadBountiesButton action={getAssignedBounties} />
    </>
  );
}
