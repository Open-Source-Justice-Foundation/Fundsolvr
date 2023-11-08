"use client";

import { useEffect, useRef, useState } from "react";

import { retrieveProfiles, sortByCreatedAt } from "@/app/lib/nostr";
import { getTagValues, parseProfileContent } from "@/app/lib/utils";
import Avatar from "@/app/messages/components/Avatar";
import { useBountyEventStore } from "@/app/stores/eventStore";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { useUserProfileStore } from "@/app/stores/userProfileStore";
import { Event, Filter, Relay, nip04 } from "nostr-tools";

export default function ChatWindow() {
  const { cachedBountyEvent, messageEvents, setMessageEvents, getMessageEvents } = useBountyEventStore();
  const { relayUrl } = useRelayStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const { getProfileEvent } = useProfileStore();
  const [participantPublicKey, setParticipantPublicKey] = useState("");

  const getChatParticipantProfile = () => {
    if (!cachedBountyEvent) {
      return;
    }

    if (userPublicKey === cachedBountyEvent.pubkey) {
      retrieveProfiles([getTagValues("p", cachedBountyEvent.tags)]);
      setParticipantPublicKey(getTagValues("p", cachedBountyEvent.tags));
    }

    if (userPublicKey === getTagValues("p", cachedBountyEvent.tags)) {
      retrieveProfiles([cachedBountyEvent.pubkey]);
      setParticipantPublicKey(cachedBountyEvent.pubkey);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  async function decryptMessage(event: Event) {
    let decryptPublicKey = "";

    if (userPublicKey === getTagValues("p", event.tags)) {
      decryptPublicKey = event.pubkey;
    } else {
      decryptPublicKey = getTagValues("p", event.tags);
    }

    if (userPrivateKey) {
      try {
        return await nip04.decrypt(userPrivateKey, decryptPublicKey, event.content);
      } catch (e) { }
    } else {
      try {
        return await nostr.nip04.decrypt(decryptPublicKey, event.content);
      } catch (e) { }
    }
  }

  async function subscribeKeepAlive(relays: string[], filter: Filter, onEvent: (event: Event) => void, onEOSE: () => void) {
    for (const url of relays) {
      const relay: Relay = await useRelayStore.getState().connect(url);

      if (!relay) return;

      let sub = relay.sub([filter]);

      sub.on("event", (event: Event) => {
        onEvent(event);
      });

      sub.on("eose", () => {
        onEOSE();
      });
    }
  }

  const fetchInitialMessages = async () => {
    if (!cachedBountyEvent) {
      return;
    }

    const creatorPublicKey = cachedBountyEvent.pubkey;
    const applicantPublicKey = getTagValues("p", cachedBountyEvent.tags);

    const messageFilter: Filter = {
      kinds: [4],
      limit: 1000,
      "#p": [creatorPublicKey, applicantPublicKey],
      "#a": [`30050:${cachedBountyEvent.pubkey}:${getTagValues("d", cachedBountyEvent.tags)}`],
    };

    const relay: Relay = await useRelayStore.getState().connect(relayUrl);

    const initialMessageEvents = await relay.list([messageFilter]);

    const unencryptedMessages = await Promise.all(
      initialMessageEvents.map(async (event: Event) => {
        const decryptedMessage = await decryptMessage(event);

        if (decryptedMessage) {
          event.content = decryptedMessage;
        } else {
          event.content = "error decrypting message";
        }

        return event;
      })
    );

    return unencryptedMessages;
  };

  function isIdPresent(events: Event[], idToCheck: string): boolean {
    return events.some((event) => event.id === idToCheck);
  }

  const listenForMessages = async () => {
    if (!cachedBountyEvent) {
      return;
    }

    const initialMessages = await fetchInitialMessages();

    if (initialMessages) {
      setMessageEvents(relayUrl, cachedBountyEvent.id, sortByCreatedAt(initialMessages));
    }

    const creatorPublicKey = cachedBountyEvent.pubkey;
    const applicantPublicKey = getTagValues("p", cachedBountyEvent.tags);

    const messageFilter: Filter = {
      kinds: [4],
      limit: 1000,
      "#p": [creatorPublicKey, applicantPublicKey],
      "#a": [`30050:${cachedBountyEvent.pubkey}:${getTagValues("d", cachedBountyEvent.tags)}`],
    };

    if (initialMessages) {
      const lastEvent = initialMessages.slice(-1)[0];
      if (lastEvent) {
        messageFilter.since = lastEvent.created_at + 10;
      }
    }

    const events: Event[] = [];

    const onEvent = async (event: Event) => {
      if (!isIdPresent(getMessageEvents(relayUrl, cachedBountyEvent.id), event.id) || !isIdPresent(events, event.id)) {
        events.push(event);
        const decryptedMessage = await decryptMessage(event);
        if (decryptedMessage) {
          event.content = decryptedMessage;
          messageFilter.since = event.created_at;

          if (!isIdPresent(getMessageEvents(relayUrl, cachedBountyEvent.id), event.id) || !isIdPresent(events, event.id)) {
            setMessageEvents(relayUrl, cachedBountyEvent.id, sortByCreatedAt([...getMessageEvents(relayUrl, cachedBountyEvent.id), event]));
          }
        } else {
          event.content = "error decrypting message";
          messageFilter.since = event.created_at;
          if (!isIdPresent(getMessageEvents(relayUrl, cachedBountyEvent.id), event.id) || !isIdPresent(events, event.id)) {
            setMessageEvents(relayUrl, cachedBountyEvent.id, sortByCreatedAt([...getMessageEvents(relayUrl, cachedBountyEvent.id), event]));
          }
        }
      } 
    };

    const onEOSE = () => {
      console.log("eose");
    };

    subscribeKeepAlive([relayUrl], messageFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    getChatParticipantProfile();
    listenForMessages();
  }, [relayUrl, userPublicKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messageEvents]);

  return (
    <div className="w-full rounded-lg border border-gray-400 dark:border-gray-700">
        <div className="mb-8 flex w-full gap-x-4 border-b border-gray-400 rounded-t-lg dark:border-gray-700 bg-gray-200 dark:bg-gray-800 py-6 pl-4">
          {cachedBountyEvent && participantPublicKey && (
            <>
              <Avatar
                src={parseProfileContent(getProfileEvent(relayUrl, participantPublicKey)?.content).picture}
                className="h-12 w-12 ring-1 ring-white dark:ring-gray-700"
                seed={getTagValues("p", cachedBountyEvent.tags)}
              />
              <div className="flex flex-col">
                <span className="text-gray-800 dark:text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, participantPublicKey)?.content).name}
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {parseProfileContent(getProfileEvent(relayUrl, participantPublicKey)?.content).about}
                </span>
              </div>
            </>
          )}
        </div>
      <div className="flex max-h-96 min-h-[16rem] flex-col overflow-y-auto  px-4 py-4">
        {cachedBountyEvent &&
          messageEvents[relayUrl] &&
          messageEvents[relayUrl][cachedBountyEvent.id] &&
          messageEvents[relayUrl][cachedBountyEvent.id].length > 0 ? (
          messageEvents[relayUrl][cachedBountyEvent.id].map((message: Event) => {
            if (userPublicKey === message.pubkey) {
              return (
                <div key={message.id} className="mb-4 flex w-full flex-col items-end justify-center">
                  <div className="flex items-center justify-center rounded-bl-3xl rounded-br-sm rounded-tl-3xl rounded-tr-3xl bg-indigo-500 dark:bg-indigo-600 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{message.content}</span>
                    </div>
                  </div>
                  {/* <span className="text-gray-100">{message.id}</span> */}
                  <span className="mt-1.5 text-xs text-gray-500">
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
                  <div className="flex items-center justify-center rounded-bl-sm rounded-br-3xl rounded-tl-3xl rounded-tr-3xl bg-gray-200 dark:bg-gray-600 px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">{message.content}</span>
                    </div>
                  </div>
                  {/* <span className="text-gray-100">{message.id || "no id"}</span> */}
                  <span className="mt-1.5 text-xs text-gray-500">
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
