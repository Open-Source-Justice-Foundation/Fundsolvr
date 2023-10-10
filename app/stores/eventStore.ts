import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { Event } from "nostr-tools";

interface BountyEventState {
  bountyEvents: Array<Event>;
  setBountyEvents: (bountyEvents: Array<Event>) => void;
  getBountyEvents: () => Array<Event>;
  cachedBounty: Event | null;
  setCachedBounty: (bounty: Event) => void;
  getCachedBounty: () => Event | null;
}

export const useBountyEventStore = create<BountyEventState>()(
  devtools(
    persist(
      (set, get) => ({
        bountyEvents: [],
        setBountyEvents: (bountyEvents) => set({ bountyEvents }),
        getBountyEvents: () => get().bountyEvents,
        cachedBounty: null,
        setCachedBounty: (bounty) => set({ cachedBounty: bounty }),
        getCachedBounty: () => get().cachedBounty,
      }),
      {
        name: "resolvr-bounty-event-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
