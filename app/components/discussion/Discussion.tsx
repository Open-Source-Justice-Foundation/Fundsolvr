"use client";

import { useEffect, useState } from "react";

import { useProfileStore } from "@/app/stores/profileStore";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { type Event, getEventHash, getSignature, nip04 } from "nostr-tools";

import { getTagValues } from "../../lib/utils";
import { useBountyEventStore } from "../../stores/eventStore";
import { useRelayStore } from "../../stores/relayStore";
import { useUserProfileStore } from "../../stores/userProfileStore";
import ChatWindow from "./ChatWindow";

export default function Discussion() {
  const { relayUrl, publish } = useRelayStore();
  const { cachedBountyEvent } = useBountyEventStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const [message, setMessage] = useState("");


  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleApply = async (e: any) => {
    if (!cachedBountyEvent) {
      alert("No bounty event cached");
      return;
    }

    if (!message) {
      alert("Message is empty");
      return;
    }

    e.preventDefault();

    let recipientPublicKey = "";

    if (userPublicKey === cachedBountyEvent.pubkey) {
      // send message to applicant
      recipientPublicKey = getTagValues("p", cachedBountyEvent.tags);
    }

    if (userPublicKey === getTagValues("p", cachedBountyEvent.tags)) {
      // send message to bounty owner
      recipientPublicKey = cachedBountyEvent.pubkey;
    }

    let encryptedMessage = "";

    if (userPrivateKey) {
      encryptedMessage = await nip04.encrypt(userPrivateKey, recipientPublicKey, message);
    } else {
      encryptedMessage = await nostr.nip04.encrypt(recipientPublicKey, message);
    }

    if (!encryptedMessage) {
      alert("Error encrypting message");
      return;
    }

    let event: Event = {
      id: "",
      sig: "",
      kind: 4,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", recipientPublicKey],
        ["e", cachedBountyEvent.id],
      ],
      content: encryptedMessage,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    console.log("message event", event);

    function onSeen() {
      // add message to cache
    }

    publish([relayUrl], event, onSeen);
  };

  return (
    <div className="w-full">
      <div className="flex w-full flex-col items-center overflow-y-auto">
        <ChatWindow />
        <div className="mt-4 flex w-full gap-x-4">
          <input
            // type="text"
            value={message}
            onChange={handleMessageChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Start a new message"
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={handleApply}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
