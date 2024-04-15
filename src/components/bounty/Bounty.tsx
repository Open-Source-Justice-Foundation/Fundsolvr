"use client";

import { useEffect } from "react";

import { useRelayStore } from "~/store/relay-store";
import { type Event, type Filter } from "nostr-tools";
import { useSubscribe } from "react-nostr";

import BountyMetadata from "./BountyMetadata";
import BountyTabs from "./BountyTabs";

type Props = {
  initialBounty: Event | undefined | null;
  selectedTab: string;
  filter: Filter;
};

export default function Bounty({
  initialBounty,
  selectedTab,
  filter,
}: Props) {
  const { subRelays } = useRelayStore();

  const eventKey = "currentBounty"

  const { events, invalidate } = useSubscribe({
    // initialEvents: initialBounties,
    eventKey,
    filter: filter,
    relays: subRelays,
  });

  useEffect(() => {
    return () => {
      void invalidate(eventKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-8 flex flex-col gap-y-4">
      {events[0] && <BountyMetadata bounty={events[0]} />}
      {events[0] && <BountyTabs bounty={events[0]} selectedTab={selectedTab} />}
    </div>
  );
}
