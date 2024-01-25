import BountyTags from "~/components/bounty-feed/BountyTags";
import { notFound } from "next/navigation";
import { type Filter } from "nostr-tools";
import BountyFeed from "~/components/bounty-feed/BountyFeed";

export default async function TagPage({
  params,
}: {
  params: Record<string, string>;
  searchParams: Record<string, string>;
}) {
  const tag = params.tag;

  if (!tag) {
    notFound();
  }

  const filter: Filter = {
    kinds: [30050],
    limit: 10,
    "#t": [tag],
  };

  return (
    <div className="min-h-screen w-full flex-col items-center">
      <div className="flex flex-col py-4">
        <div className="flex items-center justify-between">
          <h1 className="select-none text-center text-3xl font-bold">
            Bounties: {tag}
          </h1>
        </div>

        <div className="mb-2 mt-3 flex gap-x-2">
          <BountyTags />
          {/* <BountyFilter /> */}
        </div>
      </div>

      <BountyFeed filter={filter} tag={tag} eventKey={`bounty-feed-${tag}`} />
    </div>
  );
}
