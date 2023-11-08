import { RELAYS } from "@/app/lib/constants";
import { relayInit } from "nostr-tools";
import type { Event, Filter, Relay } from "nostr-tools";
import { create } from "zustand";

export interface RelaysState {
  allRelays: string[];
  setAllRelays: (allRelays: string[]) => void;
  activeRelay?: Relay;
  setActiveRelay: (relay: Relay) => void;
  relayUrl: string;
  setRelayUrl: (relayUrl: string) => void;
  connect: (newRelayUrl: string) => Promise<any>;
  connectedRelays: Set<Relay>;
  setConnectedRelays: (relays: Set<Relay>) => void;
  publish: (relays: string[], event: Event<any>, onSeen: (event: Event<any>) => void) => void;
  subscribe: (relays: string[], filter: Filter, onEvent: (event: Event<any>) => void, onEOSE: () => void) => void;
}

export const useRelayStore = create<RelaysState>((set) => ({
  allRelays: RELAYS,

  setAllRelays: (newRelays: string[]) => {
    return set({ allRelays: newRelays });
  },

  activeRelay: undefined,

  setActiveRelay: (newRelay: Relay) => {
    return set({ activeRelay: newRelay });
  },

  relayUrl: RELAYS[0],

  setRelayUrl: (relayUrl: string) => {
    return set({ relayUrl });
  },

  connect: async (newRelayUrl: string) => {
    if (!newRelayUrl) return;

    let relay: Relay;
    let existingRelay: Relay | undefined;
    const connectedRelays = useRelayStore.getState().connectedRelays;
    if (connectedRelays.size > 0) {
      existingRelay = Array.from(connectedRelays).find((r) => r.url === newRelayUrl);
    }

    if (existingRelay) {
      console.log("info", `✅ nostr (${newRelayUrl}): Already connected!`);
      relay = existingRelay;
      useRelayStore.setState({ activeRelay: relay });
    } else {
      console.log("NEWING UP A RELAY");
      relay = relayInit(newRelayUrl);

      await relay.connect();

      relay.on("connect", () => {
        console.log("info", `✅ nostr (${newRelayUrl}): Connected!`);
        const relayUrl: string = useRelayStore.getState().relayUrl;
        if (relayUrl === relay.url) {
          useRelayStore.setState({ activeRelay: relay });
          const connectedRelays = useRelayStore.getState().connectedRelays;
          const isRelayInSet = Array.from(connectedRelays).some((r) => r.url === relay.url);

          if (!isRelayInSet) {
            set((state) => ({
              ...state,
              connectedRelays: new Set([...connectedRelays, relay]),
            }));
          }
        }
      });

      relay.on("disconnect", () => {
        console.log("warn", `🚪 nostr (${newRelayUrl}): Connection closed.`);
        set({
          connectedRelays: new Set([...connectedRelays].filter((r) => r.url !== relay.url)),
        });
      });

      relay.on("error", () => {
        console.log("error", `❌ nostr (${newRelayUrl}): Connection error!`);
      });
    }

    return relay;
  },

  connectedRelays: new Set<Relay>(),

  setConnectedRelays: (relays) => set({ connectedRelays: relays }),

  publish: async (relays: string[], event: Event<any>, onSeen: (event: Event<any>) => void) => {
    console.log("publishing to relays:", relays);
    for (const url of relays) {
      const relay: Relay = await useRelayStore.getState().connect(url);

      if (!relay) return;

      try {
        await relay.publish(event);
      } catch (e) {
        console.error("Error publishing in relayStore: ", e);
      }

      let publishedEvent: Event<any> | null = await relay.get({
        ids: [event.id],
      });

      if (publishedEvent) {
        onSeen(publishedEvent);
        console.log("info", `✅ nostr (${url}): Published event!`);
      }
    }
  },

  subscribe: async (relays: string[], filter: Filter, onEvent: (event: Event<any>) => void, onEOSE: () => void) => {
    for (const url of relays) {
      const relay: Relay = await useRelayStore.getState().connect(url);

      if (!relay) return;

      let sub = relay.sub([filter]);

      sub.on("event", (event: Event<any>) => {
        onEvent(event);
      });

      sub.on("eose", () => {
        sub.unsub();
        onEOSE();
      });
    }
  },
}));
