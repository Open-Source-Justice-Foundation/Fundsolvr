"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

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
  const { setBountyEvents, getBountyEvents, bountyEvents } = useBountyEventStore();
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  function navigateToCreate() {
    router.push("/create");
  }

  const bountyFilter = {
    kinds: [30050],
    limit: 10,
    until: undefined,
    // authors: ['220522c2c32b3bf29006b275e224b285d64bb19f79bda906991bcb3861e18cb4']
  };

  const getBounties = async (filterParams?: Object) => {
    const events: Event[] = [];
    const pubkeys = new Set();

    if (bountyEvents[relayUrl]) {
      const lastEvent = bountyEvents[relayUrl].slice(-1)[0];
      console.log("lastEvent", lastEvent);
      // @ts-ignore
      bountyFilter.until = lastEvent.created_at - 10;
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

      const onEOSE = () => { };

      subscribe([relayUrl], userFilter, onEvent, onEOSE);
    };

    const filter = filterParams !== undefined ? Object.assign(bountyFilter, filterParams) : bountyFilter 
    subscribe([relayUrl], filter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (getBountyEvents(relayUrl).length > 0) {
      return;
    }
    getBounties();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg py-6">
      <div className="flex w-full max-w-5xl flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium leading-6 text-gray-100">Bounties</h1>
          <button
            onClick={navigateToCreate}
            className="flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            Bounty
          </button>
        </div>
        <p className="text-lg text-gray-400">Bounties are a way to incentivize work on a project.</p>
      </div>

      <div className="flex w-full max-w-5xl justify-center gap-x-2 overflow-x-scroll border-b border-gray-600 px-2 pb-3 text-gray-300 sm:justify-start">
        <div onClick={async () => await getBounties()} className="ml-12 flex cursor-pointer items-center gap-x-2 border-r border-gray-700 pr-2 hover:text-gray-100 sm:ml-0">
          <NewspaperIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">All Bounties</span>
        </div>
        <div onClick={async () => await getBounties({authors: ['220522c2c32b3bf29006b275e224b285d64bb19f79bda906991bcb3861e18cb4']})} className="flex cursor-pointer items-center gap-x-2 border-r border-gray-700 pr-2 hover:text-gray-100">
          <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">Posted Bounties</span>
        </div>
        <div className="flex cursor-pointer items-center gap-x-2 hover:text-gray-100">
          <UserIcon className="h-5 w-5" aria-hidden="true" />
          <span className="whitespace-nowrap">Assigned Bounties</span>
        </div>
      </div>

      {mounted && (
        <ul className="flex w-full max-w-5xl flex-col items-center justify-center gap-y-4 rounded-lg py-6">
          {bountyEvents[relayUrl] && bountyEvents[relayUrl].map((event) => <Bounty key={event.id} event={event} />)}
        </ul>
      )}
      <button
        onClick={getBounties}
        className="mb-6 flex items-center gap-x-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-indigo-500"
      >
        Load More
      </button>
    </div>
  );
}
