import { useMemo, useState } from "react";

import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import useAuth from "~/hooks/useAuth";
import { useRelayStore } from "~/store/relay-store";
import { CheckSquare, Lightbulb, UserPlus2 } from "lucide-react";
import { type Event, type EventTemplate, type Filter } from "nostr-tools";
import {
  type ATagParams,
  createATag,
  createIdentifier,
  finishEvent,
  tag,
  usePublish,
  useSubscribe,
} from "react-nostr";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

type Props = {
  bounty: Event;
  pubkey: string;
};

export default function ApplyButton({ bounty, pubkey }: Props) {
  const { subRelays, pubRelays } = useRelayStore();
  const { seckey } = useAuth();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  const aTagParams: ATagParams = useMemo(
    () => ({
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue: tag("d", bounty) ?? "",
    }),
    [bounty],
  );

  const aTag = useMemo(() => createATag(aTagParams), [aTagParams]);

  const filter: Filter = {
    kinds: [30051],
    authors: [pubkey],
    limit: 1,
    "#a": [aTag],
  };

  const { events } = useSubscribe({
    filter,
    eventKey: `applied-${aTag}`,
    relays: subRelays,
  });

  const { publish, status, addEvent, removeEvent } = usePublish({
    relays: pubRelays,
  });

  async function handleApply(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!pubkey) return;

    const dTagValue = tag("d", bounty);
    if (!dTagValue) return;

    const aTagParams: ATagParams = {
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue,
    };

    const aTag = createATag(aTagParams);

    const recommendedRelay = pubRelays[0];

    if (!recommendedRelay) return;

    const identifier = createIdentifier(bounty.id, pubkey);

    const tags = [
      ["a", aTag, recommendedRelay],
      ["p", bounty.pubkey],
      ["bounty", JSON.stringify(bounty)],
      ["s", "applied"],
      ["d", identifier],
    ];

    const t: EventTemplate = {
      kind: 30051,
      tags: tags,
      content: "",
      created_at: Math.floor(Date.now() / 1000),
    };
    const event = await finishEvent(t, seckey);
    const onSuccess = (_: Event) => {
      if (event) {
        void addEvent(aTag, event);
        void addEvent(`applied-${aTag}`, event);
      }

      setOpen(false);
    };

    await publish(event, onSuccess);
  }

  async function handleSubmitSolution(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    currentApplicationEvent: Event | undefined,
  ) {
    e.preventDefault();
    if (!pubkey) return;

    const dTagValue = tag("d", bounty);
    if (!dTagValue) return;

    const aTagParams: ATagParams = {
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue,
    };

    const aTag = createATag(aTagParams);

    const recommendedRelay = pubRelays[0];

    if (!recommendedRelay) return;

    const identifier = createIdentifier(bounty.id, pubkey);

    const tags = [
      ["a", aTag, recommendedRelay],
      ["p", bounty.pubkey],
      ["bounty", JSON.stringify(bounty)],
      ["s", "submitted"],
      ["d", identifier],
    ];

    const t: EventTemplate = {
      kind: 30051,
      tags: tags,
      content: message,
      created_at: Math.floor(Date.now() / 1000),
    };
    const event = await finishEvent(t, seckey);
    const onSuccess = (_: Event) => {
      if (event) {
        if (currentApplicationEvent) {
          void removeEvent(
            [aTag, `applied-${aTag}`],
            currentApplicationEvent.id,
          );
        }
        void addEvent(aTag, event);
        void addEvent(`applied-${aTag}`, event);
      }

      setOpen(false);
    };

    await publish(event, onSuccess);
  }

  if (!pubkey) return null;

  return (
    <>
      {events[0] && tag("s", events[0]) === "applied" && (
        <Button
          size="sm"
          disabled={status === "pending"}
          onClick={() => setOpen(true)}
          className="flex text-sm"
        >
          <CheckSquare className="mr-1 h-4 w-4" />
          Submit Solution
        </Button>
      )}
      {events[0] && tag("s", events[0]) === "submitted" && (
        <Button
          size="sm"
          disabled={status === "pending"}
          onClick={() => setOpen(true)}
          className="flex text-sm"
        >
          <Lightbulb className="mr-1 h-4 w-4" />
          Update Solution
        </Button>
      )}
      {!events[0] && (
        <Button
          size="sm"
          disabled={status === "pending"}
          onClick={handleApply}
          className="flex text-sm"
        >
          <UserPlus2 className="mr-1 h-4 w-4" />
          I'm Interested
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Solution</DialogTitle>
            <DialogDescription>
              You're solution will be made public for review. Include any
              relevant explanation or links to your work.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-2">
            <Label
              htmlFor="message"
              className="flex items-center py-4 text-left"
            >
              Reward:
              <span className="flex items-center text-base font-semibold text-orange-500 dark:text-orange-400">
                <SatoshiV2Icon className="h-5 w-5" />
                {Number(tag("reward", bounty)).toLocaleString()}
              </span>
            </Label>
            <Label htmlFor="message" className="text-left">
              Message
            </Label>
            <Textarea
              id="message"
              className="col-span-3"
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={(e) => handleSubmitSolution(e, events[0] ?? undefined)}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
