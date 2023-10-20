"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const bountyFilter = {
    kinds: [30050],
    limit: 10,
    until: undefined,
  };

  const getBounties = async () => {
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

    subscribe([relayUrl], bountyFilter, onEvent, onEOSE);
  };

  useEffect(() => {
    if (getBountyEvents(relayUrl).length > 0) {
      return;
    }
    getBounties();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-y-8 rounded-lg py-6">
      <table className="container mx-auto w-full whitespace-nowrap text-left">
        <colgroup>
          <col className="w-full sm:w-4/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
          <col className="lg:w-1/12" />
        </colgroup>
        <thead className="border-b border-gray-700 text-sm leading-6 text-white">
          <tr className="">
            <th scope="col" className="py-2 pl-4 pr-8 font-semibold sm:pl-6 lg:pl-8">
              Title
            </th>
            <th scope="col" className="py-2 pr-8 font-semibold sm:table-cell">
              Value
            </th>
            <th scope="col" className="hidden py-2 pr-4 text-right font-semibold sm:pr-8 sm:text-left lg:table-cell lg:pr-8">
              Author/Company
            </th>
            <th scope="col" className="hidden py-2 pr-8 font-semibold md:table-cell lg:pr-8">
              Status
            </th>
            <th scope="col" className="hidden py-2 font-semibold sm:table-cell lg:w-full xl:w-fit">
              Posted Date
            </th>
          </tr>
        </thead>
        {mounted && (
          <tbody className="divide-y divide-gray-700/50">
            {bountyEvents[relayUrl] && bountyEvents[relayUrl].map((event) => <Bounty key={event.id} event={event} />)}
          </tbody>
        )}
      </table>
      <button
        onClick={getBounties}
        className="flex items-center gap-x-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-indigo-500"
      >
        Load More
      </button>
    </div>
  );
}
