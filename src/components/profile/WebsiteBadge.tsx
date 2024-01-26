import React from "react";

import { useRelayStore } from "~/store/relay-store";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { profileContent, useBatchedProfiles } from "react-nostr";

import { Badge } from "../ui/badge";

type Props = {
  pubkey: string;
};

export default function WebsiteBadge({ pubkey }: Props) {
  const { subRelays } = useRelayStore();
  const profileEvent = useBatchedProfiles(pubkey, subRelays);

  if (!profileContent(profileEvent).website) return null;

  return (
    <Link
      prefetch={false}
      href={`https://${profileContent(profileEvent).website}` ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge
        className="aspect-square text-xs sm:aspect-auto"
        variant="secondary"
      >
        <GlobeIcon className="h-4 w-4 sm:mr-1" />
        <span className="hidden truncate sm:block">
          {profileContent(profileEvent).website}
        </span>
      </Badge>
    </Link>
  );
}
