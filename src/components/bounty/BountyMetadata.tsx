import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import useAuth from "~/hooks/useAuth";
import { type Event } from "nostr-tools";
import { tag } from "react-nostr";

import ApplyButton from "./ApplyButton";
import BountyMenu from "./BountyMenu";
import BountyStatusBadge from "./BountyStatusBadge";
import Profile from "./Profile";

type Props = {
  bounty: Event;
};

// TODO: skeleton loader for when bounty is undefined
export default function BountyMetadata({ bounty }: Props) {
  const { pubkey } = useAuth();

  const isLoggedInUserBounty = pubkey && bounty?.pubkey === pubkey;
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="-ml-2 flex items-center text-3xl font-semibold text-orange-500 dark:text-orange-400">
          <SatoshiV2Icon className="h-8 w-8" />
          {Number(tag("reward", bounty) ?? 0).toLocaleString()}
        </h1>
        {bounty && <BountyStatusBadge bounty={bounty} />}
      </div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {tag("title", bounty)}
      </h3>
      <div className="flex items-center justify-between gap-x-2">
        {bounty?.pubkey && <Profile pubkey={bounty?.pubkey} />}
        <div className="flex items-center gap-x-1.5">
          {bounty && !isLoggedInUserBounty && <ApplyButton bounty={bounty} />}
          {bounty && pubkey && <BountyMenu bounty={bounty} />}
        </div>
      </div>
    </>
  );
}
