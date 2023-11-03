import type { Event } from "nostr-tools";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { Profile } from "../types";

interface CurrentUserState {
  userPublicKey: string;
  userPrivateKey: string;
  setUserPublicKey: (userPublicKey: string) => void;
  setUserPrivateKey: (userPrivateKey: string) => void;
  getUserPublicKey: () => string;
  getUserPrivateKey: () => string;
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
        userPrivateKey: "",
        setUserPublicKey: (userPublicKey) => set({ userPublicKey }),
        setUserPrivateKey: (userPrivateKey) => set({ userPrivateKey }),
        getUserPublicKey: () => get().userPublicKey,
        getUserPrivateKey: () => get().userPrivateKey,
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
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
