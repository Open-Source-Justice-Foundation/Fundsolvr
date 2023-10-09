"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTagValues } from "@/app/lib/utils";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { ArrowLeftIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { nip19 } from "nostr-tools";
import { Event } from "nostr-tools";

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfile } = useProfileStore();
  const [userProfileEvent, setUserProfileEvent] = useState<Event>();
  const pathname = usePathname();
  let npub: string = "";
  if (pathname && pathname.length > 60) {
    npub = pathname.split("/").pop() || "";
    console.log("npub", npub);
  }

  return (
    <div className="lg:pl-72">
      {userProfileEvent && (
        <div className="mx-auto max-w-3xl">
          hello
        </div>
      )}
    </div>
  );
}

{
}

