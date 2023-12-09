import { useEffect, useState } from "react";

import { sortByCreatedAt } from "@/app/lib/nostr";
import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { CheckIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/24/outline";
import { Event, Filter, Relay } from "nostr-tools";

import TimelineItem from "./TimelineItem";

export default function Timeline() {
  const { relayUrl } = useRelayStore();
  const { userPublicKey } = useUserProfileStore();
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  const getRecentEvents = async () => {
    const relay: Relay = await useRelayStore.getState().connect(relayUrl);

    if (!relay) return;

    const recentEventFilter: Filter = {
      kinds: [8050, 30023, 30050],
      limit: 100,
      until: undefined,
      authors: [userPublicKey],
    };

    let events: Event[] = await relay.list([recentEventFilter]);

    events = events.sort((a, b) => b.created_at - a.created_at);
    setRecentEvents(events);
  };

  useEffect(() => {
    getRecentEvents();
  }, []);

  return (
    <div className="mt-4 flow-root border-t border-gray-300 px-4 dark:border-darkBorder">
      <h2 className="pb-8 pt-8 text-lg font-medium text-gray-500 dark:text-gray-400">Recent Activity</h2>
      <ul role="list" className="-mb-8">
        {recentEvents.slice(0, 10).map((event, eventIdx) => (
          <TimelineItem key={event.id} event={event} eventIdx={eventIdx} timelineLength={10} />
        ))}
      </ul>
    </div>
  );
}
