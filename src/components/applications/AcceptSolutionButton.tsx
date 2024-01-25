import useAuth from "~/hooks/useAuth";
import { useRelayStore } from "~/store/relay-store";
import { Check } from "lucide-react";
import { type Event, type EventTemplate } from "nostr-tools";
import { allTags, finishEvent, tag, usePublish, useZap } from "react-nostr";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { revalidateCachedTag } from "~/server";

type Props = {
  applicationEvent: Event;
  bountyEvent: Event;
  recipientMetadata: Event;
};

export default function AcceptSolutionButton({
  applicationEvent,
  bountyEvent,
  recipientMetadata,
}: Props) {
  const { pubkey, seckey } = useAuth();
  const { pubRelays, subRelays } = useRelayStore();
  const { zap, status: zapStatus } = useZap({
    eventKey: `zap-${applicationEvent.id}`,
    relays: subRelays,
  });
  //
  const { publish, removeEvent, addEvent, status } = usePublish({
    relays: pubRelays,
  });

  const sendZap = async () => {
    if (!pubkey) return;

    const onPaymentSuccess = (sendPaymentResponse: SendPaymentResponse) => {
      toast("Zap sent", {
        description: `Payment hash: ${sendPaymentResponse.paymentHash}`,
      });
    };

    const onPaymentFailure = () => {
      toast("Zap failed", {
        description: "Your zap has failed.",
      });
    };

    const onZapReceipts = (event: Event[]) => {
      toast("Zap Receipt", {
        description: "A receipt has been generated for this zap.",
      });
      void handleCompleteBounty(event[0]);
    };

    const onNoZapReceipts = () => {
      toast("Zap sent", {
        description: "Receipt not found",
      });
      void handleCompleteBounty();
    };

    if (!recipientMetadata) {
      toast("Recipient not found", {
        description: "The recipient of this bounty could not be found.",
      });
      return;
    }

    const amount = tag("reward", bountyEvent);

    await zap({
      amount: Number(amount),
      recipientMetadata: recipientMetadata,
      eventId: applicationEvent.id,
      content: "",
      secretKey: seckey,
      onPaymentSuccess,
      onPaymentFailure,
      onZapReceipts,
      onNoZapReceipts,
    });
  };

  async function handleCompleteBounty(
    zapReceiptEvent: Event | undefined = undefined,
  ) {
    console.log("zapReceiptEvent", zapReceiptEvent);

    if (!pubkey) return;

    const identifier = tag("d", bountyEvent);
    const title = tag("title", bountyEvent);
    const reward = tag("reward", bountyEvent);
    const currency = tag("c", bountyEvent);
    const tTags = allTags("t", bountyEvent);

    if (!identifier || !title || !reward || !currency) {
      return;
    }

    const tags = [
      ["d", identifier],
      ["title", title],
      ["s", "complete"],
      ["reward", reward],
      ["c", currency],
      ["p", applicationEvent.pubkey],
      ["e", applicationEvent.id],
      // ["zap_receipt", JSON.stringify(zapReceiptEvent)],
      // TODO: find out why this is adding backticks
      // ["r", JSON.stringify(applicationEvent)],
    ];

    if (subRelays[0]) {
      tags.push(["e", applicationEvent.id, subRelays[0]]);
    } else {
      tags.push(["e", applicationEvent.id]);
    }

    if (tTags.length > 0) {
      tTags.forEach((tag) => {
        tags.push(["t", tag]);
      });
    }

    const eventTemplate: EventTemplate = {
      kind: 30050,
      tags: tags,
      content: bountyEvent.content,
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await finishEvent(eventTemplate, seckey);

    const onSuccess = (event: Event) => {
      // TODO: REMOVE THE OLD APPLICATION EVENTS for the old bounty id
      revalidateCachedTag("open-bounties");
      revalidateCachedTag(`posted-bounties-${pubkey}`);
      revalidateCachedTag(`assigned-bounties-${applicationEvent.pubkey}`);
      const dTagValue = tag("d", bountyEvent);
      const bountyPubkey = bountyEvent.pubkey;
      revalidateCachedTag(`${dTagValue}-${bountyPubkey}`);
      const eventKey = "currentBounty";
      void removeEvent([eventKey], bountyEvent.id);
      void addEvent(eventKey, event);
    };

    if (!event) {
      toast("Update Failed", {
        description: "Event not published.",
      });
      return;
    }

    console.log("event", event);

    await publish(event, onSuccess);
  }

  async function handleAcceptSolution(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();

    await sendZap();
  }

  return (
    <Button
      onClick={handleAcceptSolution}
      variant="default"
      size="sm"
      className="flex gap-x-1"
      disabled={status === "pending" || zapStatus === "pending"}
    >
      <Check className="mr-1 h-4 w-4" />
      Accept Solution
    </Button>
  );
}
