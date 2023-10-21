import type { Event } from "nostr-tools";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface UserEventStore {
  userEvents: Record<string, Array<Event>>;
  setUserEvents: (key: string, userEvents: Array<Event>) => void;
  getUserEvents: (key: string) => Array<Event>;  
  cachedUserEvent: Event | null;
  setCachedUserEvent: (userEvent: Event | null) => void;
  getCachedUserEvent: () => Event | null;  
}

export const useUserEventStore = create<UserEventStore>()(
  devtools(
    persist(
      (set, get) => ({
        userEvents: {},
        setUserEvents: (key, userEvents) => set((prev) => ({ userEvents: { ...prev.userEvents, [key]: userEvents } })),
        getUserEvents: (key: string) => get().userEvents[key] ?? [],     
        cachedUserEvent: null,
        setCachedUserEvent: (userEvent) => set({ cachedUserEvent: userEvent }),
        getCachedUserEvent: () => get().cachedUserEvent,           
      }),
      {
        name: "resolvr-user-event-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
