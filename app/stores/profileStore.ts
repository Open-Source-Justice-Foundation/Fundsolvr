import type { Event } from "nostr-tools";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface ProfileState {
  profileEvents: Record<string, Event>;
  setProfileEvent: (relay: string, publicKey: string, event: Event) => void;
  getProfileEvent: (relay: string, publicKey: string) => Event | undefined;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        profileEvents: {},
        setProfileEvent: (relay: string, publicKey: string, event: Event) => {
          const newProfileEvent = { [`${relay}_${publicKey}`]: event };
          set((state) => ({ profileEvents: { ...state.profileEvents, ...newProfileEvent } }));
        },
        getProfileEvent: (relay: string, publicKey: string) => get().profileEvents[`${relay}_${publicKey}`],
      }),
      {
        name: "resolvr-profile-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
