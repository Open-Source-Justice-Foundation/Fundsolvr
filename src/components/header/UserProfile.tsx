/* eslint-disable @next/next/no-img-element */
"use client";

import { useRelayStore } from "~/store/relay-store";
import { profileContent, useBatchedProfiles } from "react-nostr";

import UserMenu from "./UserMenu";

type Props = {
  pubkey: string;
};

export default function UserProfile({ pubkey }: Props) {
  const BOT_AVATAR_ENDPOINT = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${pubkey}`;

  const { subRelays } = useRelayStore();
  const profileEvent = useBatchedProfiles(pubkey, subRelays);

  return (
    <UserMenu>
      <img
        src={profileContent(profileEvent).picture ?? BOT_AVATAR_ENDPOINT}
        alt=""
        width={34}
        height={34}
        className="aspect-square rounded-full border border-zinc-200 dark:border-zinc-800"
      />
    </UserMenu>
  );
}
