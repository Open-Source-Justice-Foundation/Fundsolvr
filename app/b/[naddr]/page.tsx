"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { getTagValues } from "@/app/lib/utils";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";
import { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfile } = useProfileStore();

  const [naddr, setNaddr] = useState<string>("");
  const [naddrPointer, setNaddrPointer] = useState<AddressPointer>();
  // TODO: get this event from cache, should cache after click since we already get it on the home page
  const [bountyEvent, setBountyEvent] = useState<Event>();
  const pathname = usePathname();
  let naddrStr: string = "";
  if (pathname && pathname.length > 60) {
    naddrStr = pathname.split("/").pop() || "";
    console.log("naddrStr", naddrStr);
  }

  useEffect(() => {
    if (naddrStr) {
      console.log("naddr", naddr);
      const naddr_data: any = nip19.decode(naddrStr).data;
      console.log("naddr_data", naddr_data);
      setNaddr(naddrStr);
      setNaddrPointer(naddr_data);

      if (naddrPointer) {
        const onEvent = (event: any) => {
          console.log("bounty event", event);
          setBountyEvent(event);
        };

        const onEOSE = () => {
          console.log("bounty eose");
        };

        const filter = {
          kinds: [naddrPointer.kind],
          authors: [naddrPointer.pubkey],
          "#d": [naddrPointer.identifier],
        };

        if (naddrPointer.relays) {
          subscribe([naddrPointer.relays[0]], filter, onEvent, onEOSE);
        } else {
          subscribe([relayUrl], filter, onEvent, onEOSE);
        }
      }
    }
  }, [naddr]);

  function setupMarkdown(content: string) {
    var md = require("markdown-it")();
    var result = md.render(content || "");
    return result;
  }

  const markdown = setupMarkdown(bountyEvent?.content || "");

  useEffect(() => {
    console.log("naddrPointer", naddrPointer);
  }, [naddrPointer]);

  return (
    <div className="lg:pl-64 pb-80">
      {bountyEvent && (
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-6 border-b border-gray-600 pb-8">
            <div className="mt-10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-3xl text-white">
                <span className="text-green-300">Earn</span>

                <svg className="fill-orange-400" width="36" height="36" viewBox="0 0 24 24">
                  <path
                    // fill="currentColor"
                    d="M14.24 10.56c-.31 1.24-2.24.61-2.84.44l.55-2.18c.62.18 2.61.44 2.29 1.74m-3.11 1.56l-.6 2.41c.74.19 3.03.92 3.37-.44c.36-1.42-2.03-1.79-2.77-1.97m10.57 2.3c-1.34 5.36-6.76 8.62-12.12 7.28C4.22 20.36.963 14.94 2.3 9.58A9.996 9.996 0 0 1 14.42 2.3c5.35 1.34 8.61 6.76 7.28 12.12m-7.49-6.37l.45-1.8l-1.1-.25l-.44 1.73c-.29-.07-.58-.14-.88-.2l.44-1.77l-1.09-.26l-.45 1.79c-.24-.06-.48-.11-.7-.17l-1.51-.38l-.3 1.17s.82.19.8.2c.45.11.53.39.51.64l-1.23 4.93c-.05.14-.21.32-.5.27c.01.01-.8-.2-.8-.2L6.87 15l1.42.36c.27.07.53.14.79.2l-.46 1.82l1.1.28l.45-1.81c.3.08.59.15.87.23l-.45 1.79l1.1.28l.46-1.82c1.85.35 3.27.21 3.85-1.48c.5-1.35 0-2.15-1-2.66c.72-.19 1.26-.64 1.41-1.62c.2-1.33-.82-2.04-2.2-2.52Z"
                  />
                </svg>

                <span className="text-green-300">{parseInt(getTagValues("value", bountyEvent.tags)).toLocaleString()}</span>
                <span className="text-green-300">(sats)</span>
              </div>

              <span className="inline-flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-white ring-2 ring-inset ring-gray-800">
                <svg className="h-2 w-2 fill-yellow-400" viewBox="0 0 6 6" aria-hidden="true">
                  <circle cx={3} cy={3} r={3} />
                </svg>
                Open
              </span>
            </div>

            <div>
              <h2 className="mb-4 text-2xl text-white">{getTagValues("title", bountyEvent.tags)}</h2>

              <div className="flex justify-between">
                <div className="flex items-center gap-x-4">
                  <img src={getProfile(relayUrl, bountyEvent.pubkey)?.picture} alt="" className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="truncate text-sm font-medium leading-6 text-white">{getProfile(relayUrl, bountyEvent.pubkey)?.name}</div>
                </div>

                <div className="flex gap-x-2">
                  <button className="rounded-lg bg-gray-700 px-2 text-white">
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>

                  <button className="flex items-center gap-x-2 rounded-lg bg-blue-500 px-2 text-sm font-medium text-white">
                    <UserPlusIcon className="h-5 w-5" />
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Bounty Description</h3>

            <div className="flex gap-2 text-sm text-gray-500">
              <span>Posted:</span>
              {new Date(bountyEvent.created_at * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-800 p-6">
            <>
              <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: markdown }}>
                {/* {bountyEvent.content} */}
              </div>
              {/* <div className="mb-2 text-xl text-white">{bountyEvent.tags.join(", ")}</div> */}
            </>
          </div>
        </div>
      )}
    </div>
  );
}

{
}
