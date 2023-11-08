"use client";

import { type Event, getEventHash, getSignature } from "nostr-tools";

import { removeTag } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

interface PropTypes {
  applicantEvent: Event;
}

export default function AssignButton({ applicantEvent }: PropTypes) {
  const { cachedBountyEvent, setCachedBountyEvent, updateBountyEvent, updateUserEvent } = useBountyEventStore();
  const { publish, relayUrl } = useRelayStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const { getActivePostRelayURLs } = usePostRelayStore();

  const handleAssign = async (e: any) => {
    e.preventDefault();
    if (!cachedBountyEvent) {
      alert("No bounty event cached");
      return;
    }

    let tags = removeTag("p", cachedBountyEvent.tags);
    const assignedTo = ["p", applicantEvent.pubkey];
    tags.push(assignedTo);
    tags = removeTag("s", tags);
    const status = ["s", "assigned"];
    tags.push(status);
    tags = removeTag("e", tags);
    const eventId = ["e", applicantEvent.id];
    tags.push(eventId);
    tags = removeTag("application", tags);
    const application = ["application", JSON.stringify(applicantEvent)];
    tags.push(application);

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

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    function onSeen() {
      if (!cachedBountyEvent) {
        return;
      }

      updateBountyEvent(relayUrl, cachedBountyEvent.id, event);
      updateUserEvent(relayUrl, cachedBountyEvent.id, event);
      setCachedBountyEvent(event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
  };

  return (
    <button
      onClick={handleAssign}
      className="mx-4 rounded-lg bg-indigo-500 p-2 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:text-white hover:dark:bg-indigo-500"
    >
      Assign
    </button>
  );
}
