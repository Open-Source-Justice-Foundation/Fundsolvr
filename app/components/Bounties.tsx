"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useUserProfileStore } from "@/app/stores/userProfileStore";
import PlusIcon from "@heroicons/react/20/solid/PlusIcon";
import { ArrowUpTrayIcon, NewspaperIcon, UserIcon } from "@heroicons/react/24/outline";
import type { Event } from "nostr-tools";

import { getTagValues } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useProfileStore } from "../stores/profileStore";
import { useRelayStore } from "../stores/relayStore";
import { Profile } from "../types";
import Bounty from "./Bounty";

export default function Bounties() {
  const { subscribe, relayUrl } = useRelayStore();
  const { setProfile } = useProfileStore();
  const { setBountyEvents, getBountyEvents, bountyEvents, setUserEvents, userEvents } = useBountyEventStore();
  const { getUserPublicKey } = useUserProfileStore();
  const [mounted, setMounted] = useState(false);

  enum BountyType {
    all = "all",
    userPosted = "userPosted",
    assigned = "assigned",
  }
  const [showBountyType, setShowBountyType] = useState<keyof typeof BountyType>(BountyType.all);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function navigateToCreate() {
    router.push("/create");
  }

  const BOUNTY_LIMIT = 10;
  const bountyFilter = {
    kinds: [30050],
    limit: BOUNTY_LIMIT,
    until: undefined,
  };

  const getBounties = async () => {
    const events: Event[] = [];
    const pubkeys = new Set();

    if (bountyEvents[relayUrl]) {
      const lastEvent = bountyEvents[relayUrl].slice(-1)[0];
      console.log("lastEvent", lastEvent);
      // @ts-ignore
      bountyFilter.until = lastEvent.created_at - BOUNTY_LIMIT;
    }

    const onEvent = (event: Event) => {
      const value = getTagValues("value", event.tags);
      if (value && value.length > 0) {
        events.push(event);
        console.log(value);
        pubkeys.add(event.pubkey);
      }
    };

    const onEOSE = () => {
      if (bountyEvents[relayUrl]) {
        setBountyEvents(relayUrl, [...bountyEvents[relayUrl], ...events]);
      } else {
        setBountyEvents(relayUrl, events);
      }
      const userFilter = {
        kinds: [0],
        authors: Array.from(pubkeys),
      };

      const onEvent = (event: Event) => {
        const profileContent = JSON.parse(event.content);

        const profile: Profile = {
          relay: relayUrl,
          publicKey: event.pubkey,
          about: profileContent.about,
          lud06: profileContent.lud06,
          lud16: profileContent.lud16,
          name: profileContent.name,
          nip05: profileContent.nip05,
          picture: profileContent.picture,
          banner: profileContent.banner,
          website: profileContent.website,
          github: profileContent.github,
          publicKeyGistId: profileContent.publicKeyGistId,
        };

        setProfile(profile);
      };

      const onEOSE = () => {};

      subscribe([relayUrl], userFilter, onEvent, onEOSE);
    };

    subscribe([relayUrl], bountyFilter, onEvent, onEOSE);
  };

  const getUserBounties = async () => {
    const events: Event[] = [];

    if (userEvents[relayUrl]) {
      const lastEvent = userEvents[relayUrl].slice(-1)[0];
      console.log("lastEvent", lastEvent);
      // @ts-ignore
      bountyFilter.until = lastEvent.created_at - BOUNTY_LIMIT;
    }

    const onEvent = (event: Event) => {
      const value = getTagValues("value", event.tags);

      if (value && value.length > 0) {
        events.push(event);
        console.log(value);
      }
    };

    const onEOSE = () => {
      if (userEvents[relayUrl]) {
        setUserEvents(relayUrl, [...userEvents[relayUrl], ...events]);
      } else {
        setUserEvents(relayUrl, events);
      }
    };

    const userPubkey = getUserPublicKey();
    const filter = userPubkey.length > 0 ? Object.assign(bountyFilter, { authors: [userPubkey] }) : bountyFilter;
    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  const showBounties = (bountyType: keyof typeof BountyType) => {
    let bountyStore: Record<string, Array<Event>> = {};
    if (bountyType === BountyType.userPosted) {
      bountyStore = userEvents;
    } else if (bountyType === BountyType.assigned) {
      // Do something with Assigned Bounties
    } else {
      bountyStore = bountyEvents;
    }
    return bountyStore[relayUrl] && bountyStore[relayUrl].map((event) => <Bounty key={event.id} event={event} />);
  };

  useEffect(() => {
    if (getBountyEvents(relayUrl).length > 0) {
      return;
    }
    getBounties();
  }, []);

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
      <div className="flex w-full max-w-4xl justify-start gap-x-2 overflow-auto border-b border-gray-300 px-2 pb-3 text-gray-600 dark:border-gray-600 dark:text-gray-300 md:overflow-hidden">
        <div
          onClick={async () => {
            await getBounties();
            setShowBountyType(BountyType.all);
          }}
          className="flex cursor-pointer items-center gap-x-2 border-r border-gray-200 pr-2 hover:text-gray-900 dark:border-gray-700 dark:hover:text-gray-100 sm:ml-0"
        >
          <NewspaperIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">All Bounties</span>
        </div>
        <div
          onClick={async () => {
            await getUserBounties();
            setShowBountyType(BountyType.userPosted);
          }}
          className="flex cursor-pointer items-center gap-x-2 border-r border-gray-200 pr-2 hover:text-gray-900 dark:border-gray-700 dark:hover:text-gray-100"
        >
          <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">Posted Bounties</span>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 hover:text-gray-900 dark:hover:text-gray-100">
          <UserIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">Assigned Bounties</span>
        </div>
      </div>

      {mounted && (
        <ul className="flex w-full max-w-4xl flex-col items-center justify-center gap-y-4 rounded-lg py-6">
          {showBounties(showBountyType)}
        </ul>
      )}
      <button
        onClick={async () => {
          await getBounties();
        }}
        className="mb-6 flex items-center gap-x-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        Load More
      </button>
    </div>
  );
}
