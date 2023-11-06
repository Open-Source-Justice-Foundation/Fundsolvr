"use client";

import { useEffect, useState } from "react";

import { retrieveProfiles } from "@/app/lib/nostr";
import { getTagValues, parseProfileContent } from "@/app/lib/utils";
import Avatar from "@/app/messages/components/Avatar";
import { useBountyEventStore } from "@/app/stores/eventStore";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Event, Filter, nip04 } from "nostr-tools";

export default function ChatWindow() {
  const { cachedBountyEvent, messageEvents, setMessageEvents, getMessageEvents } = useBountyEventStore();
  const { relayUrl, subscribeKeepAlive } = useRelayStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const { getProfileEvent } = useProfileStore();
  const [messages, setMessages] = useState<Event[]>([]);

  // TODO: keep connection alive and update messages
  const decryptMessages = async (events: Event[]) => {
    for (const event of events) {
      let decryptPublicKey = "";

      if (userPublicKey === getTagValues("p", event.tags)) {
        decryptPublicKey = event.pubkey;
      } else {
        decryptPublicKey = getTagValues("p", event.tags);
      }

      if (userPrivateKey) {
        try {
          const decryptedMessage = await nip04.decrypt(userPrivateKey, decryptPublicKey, event.content);
          console.log("decryptedMessage", decryptedMessage);
          setMessages((messages) => [...messages, { ...event, content: decryptedMessage }]);
        } catch (e) {
          setMessages((messages) => [...messages, { ...event, content: "error decrypting message" }]);
        }
      } else {
        try {
          const decryptedMessage = await nostr.nip04.decrypt(decryptPublicKey, event.content);
          setMessages((messages) => [...messages, { ...event, content: decryptedMessage }]);
        } catch (e) {
          setMessages((messages) => [...messages, { ...event, content: "error decrypting message" }]);
        }
      }
    }
  };

  const getMessages = async () => {
    setMessages([]);
    if (!cachedBountyEvent) {
      return;
    }

    if (messageEvents[relayUrl] && messageEvents[relayUrl][cachedBountyEvent.id]) {
      decryptMessages(messageEvents[relayUrl][cachedBountyEvent.id]);
    }

    const creatorPublicKey = cachedBountyEvent.pubkey;
    const applicantPublicKey = getTagValues("p", cachedBountyEvent.tags);

    const messageFilter: Filter = {
      kinds: [4],
      limit: 1000,
      "#p": [creatorPublicKey, applicantPublicKey],
      "#e": [cachedBountyEvent.id],
    };
    const events: Event[] = [];
    const pubkeys = new Set<string>();

    if (messageEvents[relayUrl] && messageEvents[relayUrl][cachedBountyEvent.id]) {
      const lastEvent = messageEvents[relayUrl][cachedBountyEvent.id].slice(-1)[0];
      if (lastEvent) {
        messageFilter.until = lastEvent.created_at - 10;
      }
    }

    const onEvent = (event: Event) => {
      console.log("message event", event);
      events.push(event);
      pubkeys.add(event.pubkey);
    };

    const onEOSE = () => {
      if (messageEvents[relayUrl] && messageEvents[relayUrl][cachedBountyEvent.id]) {
        setMessageEvents(relayUrl, cachedBountyEvent.id, [...messageEvents[relayUrl][cachedBountyEvent.id], ...events]);
      } else {
        setMessageEvents(relayUrl, cachedBountyEvent.id, events);
      }
      retrieveProfiles(Array.from(pubkeys));
      decryptMessages(events);
    };

    subscribeKeepAlive([relayUrl], messageFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    // getMessages();

    if (!cachedBountyEvent) {
      return;
    }

    if (!getProfileEvent(relayUrl, getTagValues("p", cachedBountyEvent.tags))) {
      retrieveProfiles([getTagValues("p", cachedBountyEvent.tags)]);
    }
  }, [cachedBountyEvent, relayUrl, userPublicKey]);

  useEffect(() => {
    console.log("running the thing")
    getMessages();
  }, []);

  return (
    <div className="flex min-h-[16rem] w-full flex-col rounded-lg border  border-gray-700 px-4 py-4">
      {cachedBountyEvent && userPublicKey === cachedBountyEvent.pubkey && (
        <div className="mb-8 flex w-full gap-x-4 border-b border-gray-600 bg-gray-800 py-6 pl-4">
          {cachedBountyEvent && cachedBountyEvent.tags && (
            <>
              <Avatar
                src={parseProfileContent(getProfileEvent(relayUrl, getTagValues("p", cachedBountyEvent.tags))?.content).picture}
                className="h-12 w-12 ring-1 ring-white dark:ring-gray-700"
                seed={getTagValues("p", cachedBountyEvent.tags)}
              />
              <div className="flex flex-col">
                <span className="text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, getTagValues("p", cachedBountyEvent.tags))?.content).name}
                </span>
                <span className="text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, getTagValues("p", cachedBountyEvent.tags))?.content).about}
                </span>
              </div>
            </>
          )}
        </div>
      )}
      {cachedBountyEvent && userPublicKey !== cachedBountyEvent.pubkey && (
        <div className="mb-4 flex w-full gap-x-4 border-b border-gray-600 bg-gray-800 py-6 pl-4">
          {cachedBountyEvent && cachedBountyEvent.tags && (
            <>
              <Avatar
                src={parseProfileContent(getProfileEvent(relayUrl, cachedBountyEvent.pubkey).content).picture}
                className="h-12 w-12 ring-1 ring-white dark:ring-gray-700"
                seed={getTagValues("p", cachedBountyEvent.tags)}
              />
              <div className="flex flex-col">
                <span className="text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, cachedBountyEvent.pubkey).content).name}
                </span>
                <span className="text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, cachedBountyEvent.pubkey).content).about}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {messages.length > 0 ? (
        messages.map((message) => {
          if (userPublicKey === message.pubkey) {
            return (
              <div key={message.id} className="mb-4 flex w-full flex-col items-end justify-center">
                <div className="flex items-center justify-center rounded-bl-3xl rounded-br-sm rounded-tl-3xl rounded-tr-3xl bg-indigo-600 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{message.content}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at * 1000).toLocaleDateString("en-Us", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </span>
              </div>
            );
          } else {
            return (
              <div key={message.id} className="mb-4 flex w-full flex-col items-start justify-center">
                <div className="flex items-center justify-center rounded-bl-sm rounded-br-3xl rounded-tl-3xl rounded-tr-3xl bg-gray-600 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{message.content}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at * 1000).toLocaleDateString("en-Us", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </span>
              </div>
            );
          }
        })
      ) : (
        <div className="flex w-full justify-center text-center text-xl font-semibold text-gray-300">
          <span className="rounded-lg bg-gray-700/30 p-2">This is the beginning of your discussion</span>
        </div>
      )}
    </div>
  );
}
