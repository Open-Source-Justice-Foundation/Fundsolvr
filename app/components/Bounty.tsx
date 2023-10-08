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
    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: event.pubkey,
      kind: 30050,
      relays: [relayUrl],
    };

    router.push("/b/" + nip19.naddrEncode(addressPointer));
  };

  return (
    <tr key={event.id} className="cursor-pointer" onClick={routeBounty}>
      <td className="py-4 pl-4 pr-8 sm:pl-6 lg:pl-8">
        <div className="flex gap-x-3">
          <div className="text-sm leading-6 text-gray-100">{getTagValues("title", event.tags)}</div>
        </div>
      </td>
      <td className="hidden py-4 pl-0 pr-4 text-sm leading-6 text-gray-100 sm:table-cell sm:pr-8">{getTagValues("value", event.tags)}</td>
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
  );
}
