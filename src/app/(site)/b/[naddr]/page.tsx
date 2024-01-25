import BackButton from "~/components/bounty/BackButton";
import Bounty from "~/components/bounty/Bounty";
import InvalidNaddr from "~/components/bounty/InvalidNaddr";
import { get } from "~/server/nostr";
import { unstable_cache } from "next/cache";
import { nip19, type Event, type Filter } from "nostr-tools";
import { type RelayUrl } from "react-nostr";

export default async function BountyPage({
  params,
  searchParams,
}: {
  searchParams: Record<string, string>;
  params: Record<string, string>;
}) {
  // console.log("params: ", params);
  // console.log("searchParams: ", searchParams);

  const selectedTab = searchParams.tab ?? "details";

  const naddr = params.naddr;

  try {
    if (!naddr || nip19.decode(naddr).type !== "naddr") {
      return <InvalidNaddr />;
    }
  } catch (e) {
    return <InvalidNaddr />;
  }
  const decodedNaddr = nip19.decode(naddr);
  if (decodedNaddr.type !== "naddr") {
    return <InvalidNaddr />;
  }

  const addressPointer = decodedNaddr.data;

  if (!addressPointer) {
    return <InvalidNaddr />;
  }

  const kind = addressPointer.kind;
  if (kind !== 30050) {
    return <InvalidNaddr />;
  }

  const identifier = addressPointer.identifier;
  const pubkey = addressPointer.pubkey;
  // const relays = addressPointer.relays as RelayUrl[];

  if (!identifier || !pubkey) {
    return <InvalidNaddr />;
  }

  const filter: Filter = {
    kinds: [kind],
    limit: 1,
    "#d": [identifier],
  };

  // const getCachedEvents = unstable_cache(
  //   async (relays: RelayUrl[], filter: Filter) => {
  //     const bountyEvent = await get(
  //       relays ?? ["wss://nos.lol", "wss://relay.damus.io"],
  //       filter,
  //     );
  //     if (!bountyEvent) {
  //       throw new Error("Bounty not found");
  //     }
  //     return bountyEvent;
  //   },
  //   undefined,
  //   { tags: [`${identifier}-${pubkey}`], revalidate: 60 },
  // );
  //
  // let bountyEvent;

  // try {
  //   bountyEvent = await getCachedEvents(relays, filter);
  //   bountyEvent = JSON.parse(JSON.stringify(bountyEvent)) as Event;
  // } catch (e) {
  //   console.log("e: ", e);
  // }

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex min-h-screen w-full max-w-4xl flex-col">
        <BackButton />
        <Bounty
          initialBounty={undefined}
          selectedTab={selectedTab}
          filter={filter}
        />
      </div>
    </div>
  );
}
