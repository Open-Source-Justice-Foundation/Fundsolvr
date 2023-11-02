"use client";

import { BountyTab } from "../../lib/constants";
import { useBountyEventStore } from "../../stores/eventStore";
import { useUserProfileStore } from "../../stores/userProfileStore";

export default function LoadBountiesButton(props: any) {
  const { bountyType } = useBountyEventStore();
  const { userPublicKey } = useUserProfileStore();


  return (
    <div className="mt-8">
      {bountyType === BountyTab.userPosted && !userPublicKey ? null : (
        <button
          onClick={props.action}
          className="mb-6 flex items-center gap-x-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          Load More
        </button>
      )}
    </div>
  );
}
