"use client";

import { useRouter } from "next/navigation";

import { nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

import { getTagValues } from "../lib/utils";
import { useProfileStore } from "../stores/profileStore";
import { useRelayStore } from "../stores/relayStore";

const statuses = {
  Open: "text-yellow-400 bg-yellow-400/10",
  Completed: "text-green-400 bg-green-400/10",
  Withdrawn: "text-rose-400 bg-rose-400/10",
};

function classNames(...classes: Array<any>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  event: Event;
}

export default function Bounty({ event }: Props) {
  const { relayUrl } = useRelayStore();
  const { getProfile } = useProfileStore();

  const router = useRouter();

  const routeBounty = () => {
    const identifier = getTagValues("d", event.tags);

    // TODO: handle relays
    // TODO: add tag for applicacants
    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: event.pubkey,
      kind: 30050,
      relays: [relayUrl],
    };

    router.push("/b/" + nip19.naddrEncode(addressPointer));
  };

  return (
    <>
      <style>
        {`
          .group:hover .group-hover-underline {
            text-decoration: underline;
          }
        `}
      </style>
      <tr key={event.id} className="group cursor-pointer hover:bg-gray-700/50" onClick={routeBounty}>
        <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
          <div className="flex gap-x-3">
            <div className="group-hover-underline leading-6 text-gray-100">{getTagValues("title", event.tags)}</div>
          </div>
        </td>
        <td className="hidden py-4 pl-0 pr-4 text-sm leading-6 text-gray-100 sm:table-cell sm:pr-8">
          <div className="flex items-center gap-x-2">
            <svg className="fill-orange-400" width="24" height="24" viewBox="0 0 24 24">
              <path d="M14.24 10.56c-.31 1.24-2.24.61-2.84.44l.55-2.18c.62.18 2.61.44 2.29 1.74m-3.11 1.56l-.6 2.41c.74.19 3.03.92 3.37-.44c.36-1.42-2.03-1.79-2.77-1.97m10.57 2.3c-1.34 5.36-6.76 8.62-12.12 7.28C4.22 20.36.963 14.94 2.3 9.58A9.996 9.996 0 0 1 14.42 2.3c5.35 1.34 8.61 6.76 7.28 12.12m-7.49-6.37l.45-1.8l-1.1-.25l-.44 1.73c-.29-.07-.58-.14-.88-.2l.44-1.77l-1.09-.26l-.45 1.79c-.24-.06-.48-.11-.7-.17l-1.51-.38l-.3 1.17s.82.19.8.2c.45.11.53.39.51.64l-1.23 4.93c-.05.14-.21.32-.5.27c.01.01-.8-.2-.8-.2L6.87 15l1.42.36c.27.07.53.14.79.2l-.46 1.82l1.1.28l.45-1.81c.3.08.59.15.87.23l-.45 1.79l1.1.28l.46-1.82c1.85.35 3.27.21 3.85-1.48c.5-1.35 0-2.15-1-2.66c.72-.19 1.26-.64 1.41-1.62c.2-1.33-.82-2.04-2.2-2.52Z" />
            </svg>
            {getTagValues("value", event.tags)}
            <span>(sats)</span>
          </div>
        </td>
        <td className="hidden py-4 pl-0 pr-4 sm:table-cell sm:pr-8">
          <div className="flex items-center gap-x-4">
            <img src={getProfile(relayUrl, event.pubkey)?.picture} alt="" className="h-8 w-8 rounded-full bg-gray-800" />
            <div className="truncate text-sm font-medium leading-6 text-white">{getProfile(relayUrl, event.pubkey)?.name}</div>
          </div>
        </td>
        <td className="py-4 pl-0 pr-4 text-sm leading-6">
          <div className="flex items-center justify-end gap-x-2 sm:justify-start">
            {/*@ts-ignore*/}
            {/*TODO: get status from event*/}
            <div className={classNames(statuses["Open"], "flex-none rounded-full p-1")}>
              <div className="h-1.5 w-1.5 rounded-full bg-current" />
            </div>
            <div className="hidden text-white sm:block">{"open"}</div>
          </div>
        </td>
        <td className="hidden py-4 pl-0 pr-4 text-right text-sm leading-6 text-gray-400 sm:table-cell sm:pr-6 lg:pr-8">
          <time>{new Date(event.created_at * 1000).toDateString()}</time>
        </td>
      </tr>
    </>
  );
}
