/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @next/next/no-img-element */

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { fromNow } from "~/lib/utils";
import { useRelayStore } from "~/store/relay-store";
import { User } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";
import {
  createNaddr,
  profileContent,
  shortNpub,
  tag,
  useBatchedProfiles,
} from "react-nostr";

import ApplicationCount from "../applications/ApplicationCount";

type Props = {
  bountyEvent: Event;
  showProfileInfo?: boolean;
};

export default function BountyCard({
  bountyEvent,
  showProfileInfo = true,
}: Props) {
  const pubkey = bountyEvent.pubkey;
  const { subRelays } = useRelayStore();

  const profileEvent = useBatchedProfiles(bountyEvent.pubkey, subRelays);

  return (
    <Link href={`/b/${createNaddr(bountyEvent, subRelays)}`}>
      <li className="flex cursor-pointer items-center gap-x-4 border-t p-4 hover:bg-muted/40">
        {showProfileInfo && (
          <img
            src={
              profileContent(profileEvent).picture ||
              BOT_AVATAR_ENDPOINT + pubkey
            }
            alt=""
            className="aspect-square w-16 rounded-md border border-border dark:border-border"
          />
        )}
        <div className="flex w-full flex-col gap-y-1">
          {showProfileInfo && (
            <span className="flex w-full justify-between pb-1">
              <span className="text-sm font-light text-muted-foreground">
                {profileContent(profileEvent).name || shortNpub(pubkey)}
              </span>
              {/* {tag("t", bountyEvent) && ( */}
              {/*   <Badge variant="outline">{tag("t", bountyEvent)}</Badge> */}
              {/* )} */}
            </span>
          )}
          {showProfileInfo ? (
            <span className="text-base text-card-foreground">
              {tag("title", bountyEvent)}
            </span>
          ) : (
            <span className="flex w-full justify-between pb-1">
              <span className="text-base text-card-foreground">
                {tag("title", bountyEvent)}
              </span>
              {/* {tag("t", bountyEvent) && ( */}
              {/*   <Badge variant="outline">{tag("t", bountyEvent)}</Badge> */}
              {/* )} */}
            </span>
          )}
          <span className="flex items-center text-lg font-semibold text-orange-500 dark:text-orange-400">
            <SatoshiV2Icon className="h-6 w-6" />
            {Number(tag("reward", bountyEvent)).toLocaleString()}
          </span>
          <span className="flex w-full justify-between pt-2 text-sm font-light text-muted-foreground">
            <span>{fromNow(bountyEvent.created_at) ?? "unknown"}</span>
            <span className="flex items-center gap-x-1">
              <User className="h-4 w-4" />
              <ApplicationCount bounty={bountyEvent} />
              Applicants
            </span>
          </span>
        </div>
      </li>
    </Link>
  );
}
