"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import PlusIcon from "@heroicons/react/20/solid/PlusIcon";

import { BountyTab } from "../../lib/constants";
import { useBountyEventStore } from "../../stores/eventStore";
import { useUserProfileStore } from "../../stores/userProfileStore";
import Tag from "../Tag";
import Login from "../header/Login";
import AssignedBounties from "./AssignedBounties";
import BountyTabs from "./BountyTabs";
import OpenBounties from "./OpenBounties";
import PostedBounties from "./PostedBounties";

export default function Bounties() {
  const { bountyType } = useBountyEventStore();
  const { userPublicKey } = useUserProfileStore();
  const [mounted, setMounted] = useState(false);
  const [bountyTags] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function navigateToCreate() {
    router.push("/create");
  }

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg py-6">
      <div className="flex w-full max-w-4xl flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium leading-6 text-gray-800 dark:text-gray-100">Bounties</h1>
          <button
            onClick={navigateToCreate}
            className="flex items-center gap-x-2 rounded-lg bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 "
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            Bounty
          </button>
        </div>
        <p className="hidden text-lg text-gray-500 dark:text-gray-400 md:block">Bounties are a way to incentivize work on a project.</p>
      </div>
      <BountyTabs />
      {bountyTags && (
        <div className="flex w-full max-w-4xl justify-start gap-x-2 overflow-auto">
          {Array.from(bountyTags).map((tag: any) => (
            <Tag key={tag} tag={tag} />
          ))}
        </div>
      )}

      <>
        <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-y-4 rounded-lg py-6">
          {BountyTab.all === bountyType && <OpenBounties />}
          {BountyTab.userPosted === bountyType && <PostedBounties />}
          {mounted && bountyType === BountyTab.userPosted && !userPublicKey && (
            <div className="flex flex-col items-center gap-8 text-center text-black dark:text-white">
              <p className="text-lg">you must be logged in to see your posted bounties</p>
              <Login>
                <div className="flex flex-1 justify-end">
                  <span className="mb-6 flex items-center gap-x-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500">
                    Log in <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Login>
            </div>
          )}
          {BountyTab.assigned === bountyType && <AssignedBounties />}
          {mounted && bountyType === BountyTab.assigned && !userPublicKey && (
            <div className="flex flex-col items-center gap-8 text-center text-black dark:text-white">
              <p className="text-lg">you must be logged in to see your assigned bounties</p>
              <Login>
                <div className="flex flex-1 justify-end">
                  <span className="mb-6 flex items-center gap-x-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500">
                    Log in <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Login>
            </div>
          )}
        </div>
      </>
    </div>
  );
}
