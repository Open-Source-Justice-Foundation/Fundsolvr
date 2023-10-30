"use client";

import { type Event, getEventHash } from "nostr-tools";

import { removeTag } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

export default function UnassignButton() {
  const { cachedBountyEvent, setCachedBountyEvent, updateBountyEvent, updateUserEvent } = useBountyEventStore();
  const { publish, relayUrl } = useRelayStore();
  const { userPublicKey } = useUserProfileStore();

  const handleUnassign = async (e: any) => {
    e.preventDefault();
    if (!cachedBountyEvent) {
      alert("No bounty event cached");
      return;
    }

    let tags = removeTag("p", cachedBountyEvent.tags);
    tags = removeTag("s", tags);
    const status = ["s", "open"];
    tags.push(status);

    let event: Event = {
      id: "",
      sig: "",
      kind: cachedBountyEvent.kind,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: cachedBountyEvent.content,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);
    event = await window.nostr.signEvent(event);

    function onSeen() {
      if (!cachedBountyEvent) {
        return;
      }

      updateBountyEvent(relayUrl, cachedBountyEvent.id, event);
      updateUserEvent(relayUrl, cachedBountyEvent.id, event);
      setCachedBountyEvent(event);
    }

    publish([relayUrl], event, onSeen);
  };

  return (
    <button
      onClick={handleUnassign}
      className="mx-4 rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 dark:bg-red-600 dark:text-white hover:dark:bg-red-500"
    >
      Unassign
    </button>
  );
}
