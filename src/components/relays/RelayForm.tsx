"use client";

import { Fragment, useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import useAuth from "~/hooks/useAuth";
import { useRelayStore } from "~/store/relay-store";
import { MoreVertical } from "lucide-react";
import { type Event, type EventTemplate, type Filter } from "nostr-tools";
import {
  finishEvent,
  usePublish,
  useSubscribe,
  type RelayUrl,
} from "react-nostr";
import { toast } from "sonner";

import { Separator } from "../ui/separator";

type Props = {
  pubkey: string;
};

type RelayMetadata = {
  read: Set<RelayUrl>;
  write: Set<RelayUrl>;
};

// TODO: much of this should be abstracted into a utility module
// TODO: when unsubbing from a relay, we should  invalidate the cache for all events

function normalizeUrl(inputUrl: RelayUrl) {
  try {
    const url = new URL(inputUrl);

    // Normalize the pathname by removing extra slashes
    url.pathname = url.pathname.replace(/\/+/g, "/");

    // Sort query parameters for consistent ordering
    const params = Array.from(url.searchParams.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    url.search = new URLSearchParams(params).toString();

    // TODO: clean this up
    const urlStr = url.toString();
    // remove trailing slash
    return urlStr.replace(/\/$/, "") as RelayUrl;
  } catch (error) {
    console.error("Invalid URL:", inputUrl);
    return inputUrl; // Return the original URL if it's invalid
  }
}

function relayName(relayUrl: RelayUrl) {
  const sansRelay = relayUrl.replace("wss://relay.", "");
  const sansWss = sansRelay.replace("wss://", "");
  const sansSlash = sansWss.replace("/", "");
  return sansSlash;
}

// TODO: clean this up
function getRelayMetadata(relayMetadaEvent: Event) {
  const relayMetadata: RelayMetadata = {
    read: new Set(),
    write: new Set(),
  };

  for (const tag of relayMetadaEvent.tags) {
    if (tag[0] !== "r") {
      continue;
    }
    if (tag[2] === undefined) {
      if (tag[1] && tag[1].startsWith("wss://")) {
        relayMetadata.read.add(normalizeUrl(tag[1] as RelayUrl));
        relayMetadata.write.add(normalizeUrl(tag[1] as RelayUrl));
      }
    } else if (tag[2] === "read") {
      if (tag[1] && tag[1].startsWith("wss://")) {
        relayMetadata.read.add(normalizeUrl(tag[1] as RelayUrl));
      }
    } else if (tag[2] === "write") {
      if (tag[1] && tag[1].startsWith("wss://")) {
        relayMetadata.write.add(normalizeUrl(tag[1] as RelayUrl));
      }
    }
  }
  return relayMetadata;
}

function findOverlappingRelays(
  pubRelays: string[],
  subRelays: string[],
): string[][] {
  return pubRelays
    .filter((relay) => subRelays.includes(relay))
    .map((relay) => ["r", relay]);
}

function findExclusivePubRelays(
  pubRelays: string[],
  subRelays: string[],
): string[][] {
  return pubRelays
    .filter((relay) => !subRelays.includes(relay))
    .map((relay) => ["r", relay, "write"]);
}

function findExclusiveSubRelays(
  pubRelays: string[],
  subRelays: string[],
): string[][] {
  return subRelays
    .filter((relay) => !pubRelays.includes(relay))
    .map((relay) => ["r", relay, "read"]);
}

export default function RelaySheet({ pubkey }: Props) {
  const [allRelays, setAllRelays] = useState<RelayUrl[]>([]);

  const { seckey } = useAuth();

  const { publish } = usePublish({
    relays: allRelays,
  });

  const {
    relaySheetOpen,
    setRelaySheetOpen,
    subRelays,
    pubRelays,
    setSubscribeRelays,
    setPublishRelays,
  } = useRelayStore();

  const filter: Filter = {
    kinds: [10002],
    authors: [pubkey],
  };

  const { events, status, loading } = useSubscribe({
    eventKey: "relays",
    filter,
    relays: subRelays,
  });

  useEffect(() => {
    // TODO: maybe abstract more of this
    // TODO: clean up this logic
    if (events.length > 0 && events[0]) {
      const relayMetadata = getRelayMetadata(events[0]);
      if (!relayMetadata) return;
      const subRelaysArr = subRelays.map(normalizeUrl);
      const pubRelaysArr = pubRelays.map(normalizeUrl);
      const readRelays = new Set([...subRelaysArr, ...relayMetadata.read]);
      const writeRelays = new Set([...pubRelaysArr, ...relayMetadata.write]);
      const readRelaysArray = Array.from(readRelays).map(normalizeUrl);
      const writeRelaysArray = Array.from(writeRelays).map(normalizeUrl);
      setSubscribeRelays(readRelaysArray);
      setPublishRelays(writeRelaysArray);
      const allRelaysArray = Array.from(
        new Set([...readRelaysArray, ...writeRelaysArray]),
      );
      setAllRelays(allRelaysArray);
    }
  }, [events]);

  async function handlePublishRelayMetadata(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();

    if (!pubkey) return;
    // if (!events[0]) return;

    const currentRelayMetadataTags = events[0]?.tags;


    const newRelayMetadataTags: string[][] = [];

    newRelayMetadataTags.push(...findOverlappingRelays(pubRelays, subRelays));
    newRelayMetadataTags.push(...findExclusivePubRelays(pubRelays, subRelays));
    newRelayMetadataTags.push(...findExclusiveSubRelays(pubRelays, subRelays));

    // TODO: what should I do when there is overlap between the default relays and the relays in the metadata?
    // if there is overlap, then we should just use the metadata

    const t: EventTemplate = {
      kind: 10002,
      tags: newRelayMetadataTags,
      content: "",
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await finishEvent(t, seckey);

    const onSuccess = () => {
      toast("Relays Updated", {
        description: "Your relays have been updated.",
      });
    };

    await publish(event, onSuccess);
  }

  return (
    <Sheet open={relaySheetOpen} onOpenChange={setRelaySheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Relays</SheetTitle>
          <SheetDescription>
            Make changes to your relay list here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-y-8 py-8">
          <Separator />
          {allRelays.map((relay) => (
            <Fragment key={relay}>
              <li>
                <span className="flex items-center justify-between">
                  <span>{relayName(relay)}</span>
                  <span className="flex gap-x-4">
                    <Button
                      variant={
                        subRelays.includes(relay) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (!subRelays.includes(relay)) {
                          setSubscribeRelays([...subRelays, relay]);
                        } else {
                          setSubscribeRelays(
                            subRelays.filter((r) => r !== relay),
                          );
                        }
                      }}
                    >
                      Read
                    </Button>
                    <Button
                      variant={
                        pubRelays.includes(relay) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (!pubRelays.includes(relay)) {
                          setPublishRelays([...pubRelays, relay]);
                        } else {
                          setPublishRelays(
                            pubRelays.filter((r) => r !== relay),
                          );
                        }
                      }}
                    >
                      Post
                    </Button>
                    <Button variant="ghost" size="smIcon">
                      <MoreVertical height={16} width={16} />
                    </Button>
                  </span>
                </span>
              </li>
              <Separator />
            </Fragment>
          ))}
        </ul>
        <SheetFooter>
          <Button onClick={(e) => handlePublishRelayMetadata(e)}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
