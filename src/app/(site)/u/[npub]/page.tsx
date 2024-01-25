import BountyFeed from "~/components/bounty-feed/BountyFeed";
import ProfileCard from "~/components/profile/ProfileCard";
import { notFound } from "next/navigation";
import { nip19, type Filter } from "nostr-tools";

type Props = {
  params: Record<string, string>;
};

export default async function UserProfile({ params }: Props) {
  // const session = await getServerSession(authOptions);
  // let loggedIn = false;
  // let publicKey = "";

  // if (session?.user) {
    // const user = session?.user as UserWithKeys;
    // publicKey = user.publicKey;
    // if (publicKey) {
      // loggedIn = true;
    // }
  // }

  const npub = params.npub;
  if (!npub) {
    notFound();
  }
  const decodedNpub = nip19.decode(npub);

  if (!decodedNpub) {
    notFound();
  }

  if (decodedNpub.type !== "npub") {
    notFound();
  }

  const profilePublicKey = decodedNpub.data;

  const filter: Filter = {
    kinds: [30050],
    authors: [profilePublicKey],
    limit: 10,
  };

  return (
    <div className="flex flex-col py-4">
      <ProfileCard pubkey={profilePublicKey} />
      <div className="flex flex-col w-full">
        <BountyFeed
          filter={filter}
          eventKey={`profile-feed-${profilePublicKey}`}
          showProfileInfo={false}
        />
      </div>
    </div>
  );
}
