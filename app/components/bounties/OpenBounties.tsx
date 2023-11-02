"use client";

import { useEffect, useState } from "react";

import BountyPlaceholder from "@/app/components/Skeleton/Bounty";
import type { Event, Filter } from "nostr-tools";

import { BountyTab } from "../../lib/constants";
import { getApplicants, retrieveProfiles } from "../../lib/nostr";
import { getTagValues } from "../../lib/utils";
import { useBountyEventStore } from "../../stores/eventStore";
import { useRelayStore } from "../../stores/relayStore";
import Bounty from "./Bounty";
import LoadBountiesButton from "./LoadBountiesButton";
import NoBounties from "./NoBounties";

export default function Bounties() {
  const { subscribe, relayUrl } = useRelayStore();
  const { setBountyEvents, getBountyEvents, bountyEvents, bountyType } = useBountyEventStore();
  const [loading, setLoading] = useState({ all: false });

  const getBounties = async () => {
    setLoading({ ...loading, all: true });

    const bountyFilter: Filter = {
      kinds: [30050],
      limit: 10,
      until: undefined,
      "#s": ["open"],
    };
    const events: Event[] = [];
    const pubkeys = new Set<string>();
    const dValues = new Set<string>();

    if (bountyEvents[relayUrl]) {
      const lastEvent = bountyEvents[relayUrl].slice(-1)[0];
      if (lastEvent) {
        bountyFilter.until = lastEvent.created_at - 10;
      }
    }

    const onEvent = (event: Event) => {
      // TODO: check for zap recipt
      const value = getTagValues("value", event.tags);
      if (value && value.length > 0) {
        events.push(event);
        pubkeys.add(event.pubkey);
        dValues.add(getTagValues("d", event.tags));
      }
    };

    const onEOSE = () => {
      if (bountyEvents[relayUrl]) {
        setBountyEvents(relayUrl, [...bountyEvents[relayUrl], ...events]);
      } else {
        setBountyEvents(relayUrl, events);
      }

      retrieveProfiles(Array.from(pubkeys));
      getApplicants(dValues);
      setLoading({ ...loading, all: false });
    };

    subscribe([relayUrl], bountyFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (getBountyEvents(relayUrl).length < 1) {
      getBounties();
    }
  }, [relayUrl]);

  // TODO: improve loading state, shouldn't change all entries to loading when loading more
  return (
    <>
      {loading.all
        ? Array.from(Array(5)).map((i) => <BountyPlaceholder key={i} />)
        : bountyType === BountyTab.all &&
        bountyEvents[relayUrl] &&
        (bountyEvents[relayUrl].length ? bountyEvents[relayUrl].map((event) => <Bounty key={event.id} event={event} />) : <NoBounties />)}
      <LoadBountiesButton action={getBounties} />
    </>
  );
}
