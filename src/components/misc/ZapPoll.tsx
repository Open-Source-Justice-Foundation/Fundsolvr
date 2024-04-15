import { useEffect, useState } from "react";

import useAuth from "~/hooks/useAuth";
import { useRelayStore } from "~/store/relay-store";
import { type Event } from "nostr-tools";
import { tag, usePublish, useSubscribe, useZap } from "react-nostr";
import { toast } from "sonner";

import { Button } from "../ui/button";

type Props = {
  bountyEvent: Event;
};

export default function ZapPoll({ bountyEvent }: Props) {
  const filter = {
    kinds: [9735],
    "#e": [bountyEvent.id],
  };

  const { pubkey, seckey } = useAuth();
  const { pubRelays, subRelays } = useRelayStore();
  const { zap, status: zapStatus } = useZap({
    eventKey: `zap-${bountyEvent.id}`,
    relays: subRelays,
  });
  //
  const { status } = usePublish({
    relays: pubRelays,
  });
  // const [pollResults, setPollResults] = useState({ yes: 0, no: 0 });

  const { events: zapReceiptEvents, loadNewerEvents } = useSubscribe({
    // initialEvents: initialBounties,
    eventKey: `zap-receipt-${bountyEvent.id}`,
    filter: filter,
    relays: subRelays,
  });

  const handleCountPollResults = () => {
    let yesCount = 0;
    let noCount = 0;

    // console.log(zapReceiptEvents);

    for (const event of zapReceiptEvents) {
      if (event.content === "yes") {
        yesCount += 1;
      } else {
        noCount += 1;
      }
    }

    return { yes: yesCount, no: noCount };
  };

  const sendZap = async (choice: string) => {
    // console.log("sending zap");
    // console.log(choice);
    // console.log(bountyEvent);
    // console.log(pubkey);
    if (!pubkey) return;

    const onPaymentSuccess = (
      sendPaymentResponse: SendPaymentResponse | string,
    ) => {
      toast("Zap sent", {
        // description: `Payment hash: ${sendPaymentResponse.paymentHash}`,
        description: "Your zap has been sent.",
      });
    };

    const onPaymentFailure = () => {
      toast("Zap failed", {
        description: "Your zap has failed.",
      });
    };

    const onZapReceipts = (_: Event[]) => {
      toast("Zap Receipt", {
        description: "A receipt has been generated for this zap.",
      });
      void loadNewerEvents(`zap-receipt-${bountyEvent.id}`, 1);
    };

    const onNoZapReceipts = () => {
      toast("Zap sent", {
        description: "Receipt not found",
      });
    };

    const amount = "10";

    const recipientMetadata: Event = {
      kind: 0,
      id: "be234ea5d64eca32c3bb357414b462f9a0c839ffe591dda42c3dc1dbdccbada7",
      tags: [],
      pubkey:
        "e3db7072b5a799083f82332132971af0e1ebf1e50fae9938e39e3177ef2b90c4",
      content:
        '{"picture":"https://www.chrisatmachine.com/assets/headshot.jpg","name":"chrisatmachine","website":"chrisatmachine.com","about":"The world has gone mad","lud16":"chrisatmachine@getalby.com","github":""}',
      sig: "b94b6a11263439ea27d9dded55e12441d3a609149f76e9efd33de781fbbb467f72806bd12c60ee6785c2d20ab3dd9e3db326dc4106d26e53db5937cba44ae15f",
      created_at: 1713174797,
    };

    await zap({
      amount: Number(amount),
      recipientMetadata: recipientMetadata,
      eventId: bountyEvent.id,
      content: choice,
      useQRCode: false,
      onPaymentSuccess,
      onPaymentFailure,
      onZapReceipts,
      onNoZapReceipts,
    });
  };

  async function handleYes(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    for (const event of zapReceiptEvents) {
      if (tag("P", event) === pubkey) {
        toast("You have already voted", {
          description: "You have already voted in this poll.",
        });
        return;
      }
    }

    await sendZap("yes");
  }

  async function handleNo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    for (const event of zapReceiptEvents) {
      if (tag("P", event) === pubkey) {
        toast("You have already voted", {
          description: "You have already voted in this poll.",
        });
        return;
      }
    }

    await sendZap("no");
  }

  return (
    <div className="flex gap-y-4 flex-col">
      <span className="font-medium">Was this bounty completed successfully?</span>
      <span className="flex gap-x-1">Yes: {handleCountPollResults().yes}</span>
      <span className="flex gap-x-1">No: {handleCountPollResults().no}</span>

      <div className="flex gap-x-2">
        <Button
          onClick={handleYes}
          variant="default"
          size="sm"
          className="flex gap-x-1"
          disabled={status === "pending" || zapStatus === "pending"}
        >
          Yes
        </Button>
        <Button
          onClick={handleNo}
          variant="default"
          size="sm"
          className="flex gap-x-1"
          disabled={status === "pending" || zapStatus === "pending"}
        >
          No
        </Button>
      </div>
    </div>
  );
}
