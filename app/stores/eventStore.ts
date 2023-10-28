import type { Event } from "nostr-tools";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface BountyEventState {
  bountyEvents: Record<string, Array<Event>>;
  setBountyEvents: (key: string, bountyEvents: Array<Event>) => void;
  getBountyEvents: (key: string) => Array<Event>;
  cachedBountyEvent: Event | null;
  setCachedBountyEvent: (bounty: Event | null) => void;
  getCachedBountyEvent: () => Event | null;
  deleteBountyEvent: (key: string, id: string) => void;

  userEvents: Record<string, Array<Event>>;
  setUserEvents: (key: string, userEvents: Array<Event>) => void;
  getUserEvents: (key: string) => Array<Event>;
  cachedUserEvent: Event | null;
  setCachedUserEvent: (userEvent: Event | null) => void;
  getCachedUserEvent: () => Event | null;
  deleteUserEvent: (key: string, id: string) => void;

  tag: string;
  setTag: (tag: string) => void;
  getTag: () => string;

  applicantEvents: Record<string, Record<string, Record<string, Event>>>;
  setApplicantEvent: (relayUrl: string, bountId: string, publicKey: string, applicantEvents: Event) => void;
  getApplicantEvent: (relayUrl: string, bountyId: string, pubkey: string) => Event | null;
  getBountyApplicants: (relayUrl: string, bountyId: string) => Record<string, Event>;

  bountyType: "all" | "userPosted" | "assigned";
  setBountyType: (bountyType: "all" | "userPosted" | "assigned") => void;
}

export const useBountyEventStore = create<BountyEventState>()(
  devtools(
    persist(
      (set, get) => ({
        bountyEvents: {},
        setBountyEvents: (key, bountyEvents) => set((prev) => ({ bountyEvents: { ...prev.bountyEvents, [key]: bountyEvents } })),
        getBountyEvents: (key: string) => get().bountyEvents[key] ?? [],
        cachedBountyEvent: null,
        setCachedBountyEvent: (bounty) => set({ cachedBountyEvent: bounty }),
        getCachedBountyEvent: () => get().cachedBountyEvent,
        deleteBountyEvent: (key: string, id: string) =>
          set((prev) => ({
            bountyEvents: { [key]: prev.bountyEvents[key].filter((bountyEvent) => bountyEvent.id !== id) },
          })),

        userEvents: {},
        setUserEvents: (key, userEvents) => set((prev) => ({ userEvents: { ...prev.userEvents, [key]: userEvents } })),
        getUserEvents: (key: string) => get().userEvents[key] ?? [],
        cachedUserEvent: null,
        setCachedUserEvent: (userEvent) => set({ cachedUserEvent: userEvent }),
        getCachedUserEvent: () => get().cachedUserEvent,
        deleteUserEvent: (key: string, id: string) =>
          set((prev) => ({
            userEvents: { [key]: prev.userEvents[key].filter((userEvent) => userEvent.id !== id) },
          })),

        tag: "",
        setTag: (tag) => set({ tag }),
        getTag: () => get().tag,

        applicantEvents: {},

        setApplicantEvent: (relayUrl: string, bountyId: string, pubkey: string, applicantEvent: Event) => {
          set((prev) => {
            const prevRelayEvents = prev.applicantEvents[relayUrl] || {};

            const prevBountyEvents = prevRelayEvents[bountyId] || {};

            return {
              applicantEvents: {
                ...prev.applicantEvents,
                [relayUrl]: {
                  ...prevRelayEvents,
                  [bountyId]: {
                    ...prevBountyEvents,
                    [pubkey]: applicantEvent,
                  },
                },
              },
            };
          });
        },

        getApplicantEvent: (relayUrl: string, bountyId: string, pubkey: string) => {
          const relayEvents = get().applicantEvents[relayUrl] || {};
          const bountyEvents = relayEvents[bountyId] || {};

          return bountyEvents[pubkey] || null;
        },

        getBountyApplicants: (relayUrl: string, bountyId: string) => {
          const relayEvents = get().applicantEvents[relayUrl] || {};

          return relayEvents[bountyId] || {};
        },

        bountyType: "all",
        setBountyType: (bountyType) => set({ bountyType }),
      }),
      {
        name: "resolvr-bounty-event-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
