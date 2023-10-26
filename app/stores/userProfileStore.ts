import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { Profile } from "../types";
import type { Event } from "nostr-tools";

interface CurrentUserState {
  userPublicKey: string;
  setUserPublicKey: (userPublicKey: string) => void;
  getUserPublicKey: () => string;
  userProfile: Record<string, Profile>;
  setUserProfile: (relay: string, profile: Profile) => void;
  getUserProfile: (relay: string) => Profile;
  clearUserProfile: () => void;
  userEvent: Record<string, Event | null>;
  setUserEvent: (relay: string, userEvent: Event) => void;
  getUserEvent: (relay: string) => Event | null;
}

export const useUserProfileStore = create<CurrentUserState>()(
  devtools(
    persist(
      (set, get) => ({
        userPublicKey: "",
        setUserPublicKey: (userPublicKey) => set({ userPublicKey }),
        getUserPublicKey: () => get().userPublicKey,
        userProfile: {},
        setUserProfile: (relay, userProfile) => set((state) => ({ userProfile: { ...state.userProfile, [relay]: userProfile } })),
        getUserProfile: (relay) => get().userProfile && get().userProfile[relay],
        clearUserProfile: () => set({ userProfile: {} }),
        userEvent: {},
        setUserEvent: (relay, userEvent) => set((state) => ({ userEvent: { ...state.userEvent, [relay]: userEvent } })),
        getUserEvent: (relay) => get().userEvent && get().userEvent[relay],
      }),
      {
        name: "resolvr-login-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
