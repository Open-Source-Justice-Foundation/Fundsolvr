/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */
"use client";

import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { useRelayStore } from "~/store/relay-store";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { profileContent, shortNpub, useBatchedProfiles } from "react-nostr";

type Props = {
  pubkey: string;
};

export default function Profile({ pubkey }: Props) {
  const { subRelays } = useRelayStore();
  const profileEvent = useBatchedProfiles(pubkey, subRelays);

  return (
    <Link
      className="flex items-center gap-x-2"
      href={`/u/${nip19.npubEncode(pubkey)}`}
    >
      <img
        src={
          profileContent(profileEvent).picture || BOT_AVATAR_ENDPOINT + pubkey
        }
        alt=""
        className="aspect-square w-8 rounded-full border border-border dark:border-border"
      />
      <span className="text-base text-muted-foreground">
        {profileContent(profileEvent).name || shortNpub(pubkey)}
      </span>
    </Link>
  );
}
