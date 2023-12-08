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
  const { userPublicKey } = useUserProfileStore();
  const [loading, setLoading] = useState({ assigned: false });

  // TODO: check if user has been paid for bounty
  // if so don't show it
  const getAssignedBounties = async () => {
    if (userPublicKey && !assignedEvents[relayUrl]) {
      setLoading({ ...loading, assigned: true });
    }

    const events: Event[] = [];
    const pubkeys = new Set<string>();
    const dValues = new Set<string>();

    const assignedBountyFilter: Filter = {
      kinds: [30050],
      limit: 10,
      until: undefined,
      "#p": [userPublicKey],
    };

    if (assignedEvents[relayUrl]) {
      const lastEvent = assignedEvents[relayUrl].slice(-1)[0];
      if (lastEvent) {
        assignedBountyFilter.until = lastEvent.created_at - 10;
      }
    }

    const onEvent = (event: Event) => {
      // TODO: check for zap recipt
      const value = getTagValues("reward", event.tags);
      if (value && value.length > 0) {
        events.push(event);
        pubkeys.add(event.pubkey);
        dValues.add(getTagValues("d", event.tags));
      }
    };

    const onEOSE = () => {
      if (assignedEvents[relayUrl]) {
        setAssignedEvents(relayUrl, [...assignedEvents[relayUrl], ...events]);
      } else {
        setAssignedEvents(relayUrl, events);
      }
      retrieveProfiles(Array.from(pubkeys));
      getApplicants(dValues);
      setLoading({ ...loading, assigned: false });
    };

    subscribe([relayUrl], assignedBountyFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (userPublicKey) {
      getAssignedBounties();
    }
  }, [userPublicKey, relayUrl]);

  return (
    <>
      {loading.assigned
        ? Array.from(Array(5)).map((i) => <BountyPlaceholder key={i} />)
        : bountyType === BountyTab.assigned &&
          assignedEvents[relayUrl] &&
          userPublicKey &&
          (assignedEvents[relayUrl].length ? (
            filterBounties(search, assignedEvents[relayUrl]).map((event) => <Bounty key={event.id} event={event} />)
          ) : (
            <NoBounties />
          ))}
      <LoadBountiesButton action={getAssignedBounties} />
    </>
  );
}
