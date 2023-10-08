"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { useRelayStore } from "@/app/stores/relayStore";
import { nip19 } from "nostr-tools";
import { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();

  const [naddr, setNaddr] = useState<string>("");
  const [naddrPointer, setNaddrPointer] = useState<AddressPointer>();
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

  useEffect(() => {
    console.log("naddrPointer", naddrPointer);
  }, [naddrPointer]);

  return (
    <div className="text-white">
      <div className="text-2xl">Bounty</div>
      <div className="text-2xl">{naddr}</div>
      <div className="text-2xl">{naddrPointer?.identifier}</div>
      <div className="text-2xl">{naddrPointer?.pubkey}</div>
      <div className="text-2xl">{naddrPointer?.kind}</div>
      <div className="text-2xl">{naddrPointer?.relays}</div>
      <div className="text-2xl">{bountyEvent?.pubkey}</div>
      <div className="text-2xl">{bountyEvent?.content}</div>
      <div className="text-2xl">{bountyEvent?.tags}</div>
      <div className="text-2xl">{bountyEvent?.created_at}</div>
    </div>
  );
}
