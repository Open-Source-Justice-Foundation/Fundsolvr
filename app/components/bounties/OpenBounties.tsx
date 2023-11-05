"use client";

import { useEffect, useState } from "react";

import BountyPlaceholder from "@/app/components/Skeleton/Bounty";
import type { Event, Filter } from "nostr-tools";

import { BountyTab } from "../../lib/constants";
import { filterBounties, getApplicants, getTaggedBounties, retrieveProfiles } from "../../lib/nostr";
import { getTagValues } from "../../lib/utils";
import { useBountyEventStore } from "../../stores/eventStore";
import { useRelayStore } from "../../stores/relayStore";
import Bounty from "./Bounty";
import LoadBountiesButton from "./LoadBountiesButton";
import NoBounties from "./NoBounties";

export default function Bounties() {
  const { subscribe, relayUrl } = useRelayStore();
  const { setBountyEvents, getBountyEvents, bountyEvents, bountyType, search, tag, taggedBountyEvents, getTag, getTaggedBountyEvents } = useBountyEventStore();
  const [loading, setLoading] = useState({ all: false });

  const getBounties = async () => {
    if (tag === "All") {
      setLoading({ ...loading, all: true });
    }

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
      const value = getTagValues("reward", event.tags);
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

  const localGetTaggedBounties = async () => {
    getTaggedBounties(tag, loading, setLoading);
  };

  useEffect(() => {
    // do something with tags and do this else if
    if (getTaggedBountyEvents(relayUrl, tag) && tag !== "All") {
      localGetTaggedBounties();
    }

    if (getBountyEvents(relayUrl).length < 1 && tag === "All") {
      getBounties();
    }
  }, [relayUrl, tag]);

  // TODO: improve loading state, shouldn't change all entries to loading when loading more
  return (
    <>
      {loading.all && tag === "All"
        ? Array.from(Array(5)).map((i) => <BountyPlaceholder key={i} />)
        : bountyType === BountyTab.all &&
        tag === "All" &&
        bountyEvents[relayUrl] &&
        (bountyEvents[relayUrl].length ? (
          filterBounties(search, bountyEvents[relayUrl]).map((event) => <Bounty key={event.id} event={event} />)
        ) : (
          <NoBounties />
        ))}
      {loading.all && tag !== "All"
        ? Array.from(Array(5)).map((i) => <BountyPlaceholder key={i} />)
        : bountyType === BountyTab.all &&
        tag !== "All" &&
        taggedBountyEvents[relayUrl] &&
        taggedBountyEvents[relayUrl][tag] &&
        (taggedBountyEvents[relayUrl][tag].length ? (
          filterBounties(search, taggedBountyEvents[relayUrl][tag]).map((event) => <Bounty key={event.id} event={event} />)
        ) : (
          <NoBounties />
        ))}
      <LoadBountiesButton action={localGetTaggedBounties} />
    </>
  );
}
