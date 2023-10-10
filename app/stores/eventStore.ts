import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { Event } from "nostr-tools";

interface BountyEventState {
  bountyEvents: Array<Event>;
  setBountyEvents: (bountyEvents: Array<Event>) => void;
  getBountyEvents: () => Array<Event>;
  cachedBountyEvent: Event | null;
  setCachedBountyEvent: (bounty: Event) => void;
  getCachedBountyEvent: () => Event | null;
}

export const useBountyEventStore = create<BountyEventState>()(
  devtools(
    persist(
      (set, get) => ({
        bountyEvents: [],
        setBountyEvents: (bountyEvents) => set({ bountyEvents }),
        getBountyEvents: () => get().bountyEvents,
        cachedBountyEvent: null,
        setCachedBountyEvent: (bounty) => set({ cachedBountyEvent: bounty }),
        getCachedBountyEvent: () => get().cachedBountyEvent,
      }),
      {
        name: "resolvr-bounty-event-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
