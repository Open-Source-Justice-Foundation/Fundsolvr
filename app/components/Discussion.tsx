"use client";

import { useState } from "react";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { type Event, getEventHash, getSignature } from "nostr-tools";

import { getTagValues } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

export default function Discussion() {
  const { relayUrl, publish } = useRelayStore();
  const { cachedBountyEvent } = useBountyEventStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleApply = async (e: any) => {
    if (!cachedBountyEvent) {
      alert("No bounty event cached");
      return;
    }
    e.preventDefault();

    if (cachedBountyEvent.pubkey === userPublicKey) {

    }


    const encryptedMessage = await window.nostr.nip04.encrypt(cachedBountyEvent.pubkey, message);

    let event: Event = {
      id: "",
      sig: "",
      kind: 4,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["e", cachedBountyEvent.id]],
      content: encryptedMessage,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);
    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    console.log("event", event);

    function onSeen() {
      setOpen(false);
      // setApplicantEvent(relayUrl, getTagValues("d", bountyEvent.tags), userPublicKey, event);
    }

    // publish([relayUrl], event, onSeen);
  };

  return (
    <>
      <div className="text-start">
        <h2 className="pt-8 font-semibold text-gray-800 dark:text-gray-100">Message</h2>
        <textarea
          // type="text"
          value={message}
          onChange={handleMessageChange}
          className="mt-4 w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          placeholder="I would like to apply to this bounty because..."
        />
      </div>
      <div className="mt-5 flex justify-end sm:mt-6">
        <button
          type="button"
          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleApply}
        >
          Send Message
        </button>
      </div>
    </>
  );
}
