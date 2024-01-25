import { type RelayUrl } from "react-nostr";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { DEFAULT_PUBLISH_RELAYS, DEFAULT_SUBSCRIBE_RELAYS } from "~/lib/constants";

interface RelayState {
  relaySheetOpen: boolean;
  setRelaySheetOpen: (open: boolean) => void;
  subRelays: RelayUrl[];
  pubRelays: RelayUrl[];
  setSubscribeRelays: (relays: RelayUrl[]) => void;
  setPublishRelays: (relays: RelayUrl[]) => void;
}

export const useRelayStore = create<RelayState>()(
  devtools(
    persist(
      (set, _) => ({
        relaySheetOpen: false,
        setRelaySheetOpen: (open) => set({ relaySheetOpen: open }),
        subRelays: DEFAULT_SUBSCRIBE_RELAYS,
        pubRelays: DEFAULT_PUBLISH_RELAYS,
        setSubscribeRelays: (relays) => set({ subRelays: relays }),
        setPublishRelays: (relays) => set({ pubRelays: relays }),
      }),
      {
        name: "resolvr-relay-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          subscribeRelays: state.subRelays,
          publishRelays: state.pubRelays,
        }),
      },
    ),
  ),
);
