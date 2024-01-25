import React from "react";

import { capitalizeFirstLetter } from "~/lib/utils";
import { type Event } from "nostr-tools";
import { tag } from "react-nostr";

import { Badge } from "../ui/badge";

type Props = {
  bounty: Event;
};

export default function BountyStatusBadge({ bounty }: Props) {
  return (
    <>
      {tag("s", bounty) === "open" && (
        <Badge className="text-sm" variant="outline">
          <span className="mr-2 block h-2 w-2 rounded-full bg-yellow-500 dark:text-yellow-400" />
          {capitalizeFirstLetter(tag("s", bounty))}
        </Badge>
      )}
      {bounty && tag("s", bounty) === "complete" && (
        <Badge className="text-sm" variant="outline">
          <span className="mr-2 block h-2 w-2 rounded-full bg-green-500 dark:text-green-400" />
          Complete
        </Badge>
      )}
    </>
  );
}
