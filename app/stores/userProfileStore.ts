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
  userEvent: Event | null;
  setUserEvent: (userEvent: Event) => void;
  getUserEvent: () => Event | null;
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
        userEvent: null,
        setUserEvent: (userEvent) => set({ userEvent }),
        getUserEvent: () => get().userEvent,
      }),
      {
        name: "notebin-login-storage",
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
