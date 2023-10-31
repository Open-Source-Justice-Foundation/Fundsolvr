import { Fragment, useEffect, useRef, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { type Event, EventTemplate, Filter, UnsignedEvent, getEventHash, nip57 } from "nostr-tools";

import { fetchInvoice, getZapEndpoint, getZapRecieptFromRelay } from "../lib/nostr";
import { getTagValues, removeTag } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import { LightningCircleIcon, LightningIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

interface Props {
  applicantProfile: Event;
}

export default function CompleteButton({ applicantProfile }: Props) {
  let [isOpen, setIsOpen] = useState(false);
  const [isZapConfirmationOpen, setIsZapConfirmationOpen] = useState(false);
  const [isZapSuccess, setIsZapSuccess] = useState(true);
  const [tipMessage, setZapMessage] = useState<string>();
  const [paymentHash, setPaymentHash] = useState();
  const [tippedAmount, setZappedAmount] = useState<any>();

  const [callCount, setCallCount] = useState(0); // State to track the number of calls
  const intervalRef = useRef<number | undefined>(); // Explicitly typing intervalRef

  const { cachedBountyEvent } = useBountyEventStore();
  const { relayUrl } = useRelayStore();
  const { userPublicKey } = useUserProfileStore();

  useEffect(() => {
    setZapMessage("");
  }, [isOpen]);

  const connectHandler = async () => {
    try {
      // TODO: check if already enabled
      const enabled = await window.webln.enable();
      // TODO: maybe save this state later
    } catch (e) {
      console.log("Connect Error:", e);
    }
  };

  const openZapModal = () => {
    setIsOpen(true);
  };

  const handleSendZap = async (e: any) => {
    e.preventDefault();

    if (typeof window.webln !== "undefined") {
      connectHandler();

      if (!cachedBountyEvent) {
        alert("No bounty event cached");
        return;
      }

      const zapEndpoint = await getZapEndpoint(applicantProfile);

      if (!zapEndpoint) {
        alert("No zap endpoint found");
        return;
      }

      const zapArgs = {
        profile: applicantProfile.pubkey,
        event: cachedBountyEvent.id,
        amount: Number(getTagValues("value", cachedBountyEvent.tags)) * 1000, // it's in millisats
        relays: [relayUrl],
        comment: "bounty complete",
      };

      const zapEventTemplate: EventTemplate = nip57.makeZapRequest(zapArgs);
      const unsignedZapEvent: UnsignedEvent = {
        ...zapEventTemplate,
        pubkey: userPublicKey,
      };

      const zapId = getEventHash(unsignedZapEvent);
      const zapEvent = await window.nostr.signEvent({ ...unsignedZapEvent, id: zapId });
      console.log("zapEvent", zapEvent);

      const invoice = await fetchInvoice(zapEndpoint, zapEvent);

      console.log("invoice", invoice);

      try {
        const result = await webln.sendPayment(invoice);
        console.log("Zap Result:", result);

        // TODO: get this from th invoice in the future
        setZappedAmount(getTagValues("value", cachedBountyEvent.tags));
        // @ts-ignore
        setPaymentHash(result.paymentHash);
        setIsZapSuccess(true);
      } catch (e) {
        console.log("Zap Error:", e);
        setIsZapSuccess(false);
      }
    }

    setIsOpen(!isOpen);
    setIsZapConfirmationOpen(!isZapConfirmationOpen);
  };

  useEffect(() => {
    // poll the relay for the zap receipt
    if (!cachedBountyEvent || paymentHash == null) {
      return;
    }

    // Reset call count on every paymentHash change
    setCallCount(0);

    // Set an interval to call the function every 2 seconds
    intervalRef.current = window.setInterval(() => {
      getZapRecieptFromRelay(cachedBountyEvent);

      // Increment the call count and clear the interval after 5 calls
      setCallCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount >= 5) {
          clearInterval(intervalRef.current);
        }
        return newCount;
      });
    }, 2000);

    // Clean up the interval when the component unmounts or paymentHash changes
    return () => clearInterval(intervalRef.current);
  }, [paymentHash]);

  return (
    <>
      <button
        onClick={openZapModal}
        className="mx-4 flex items-center rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 dark:bg-green-600 dark:text-white hover:dark:bg-green-500"
      >
        <LightningIcon className="h-5 w-5" />
        Pay
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog className="fixed z-50" open={isOpen} onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="fixed w-full max-w-sm -translate-y-1/4 transform rounded-lg bg-slate-50 p-6 text-base font-semibold text-slate-900 shadow-xl dark:bg-slate-800 dark:text-slate-100 md:max-w-md">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center text-slate-500 hover:text-slate-600 hover:dark:text-slate-300"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center justify-center text-xl">
                  <Dialog.Title>Accept & Reward</Dialog.Title>
                </div>

                <form onSubmit={handleSendZap}>
                  <div className="mt-8">Amount:</div>
                  <div className="mt-8">
                    <label htmlFor="message" className="block text-sm font-semibold">
                      Message
                    </label>
                    <div className="mt-3">
                      <input
                        type="text"
                        name="message"
                        id="message"
                        placeholder="Optional"
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-purple-300 focus:ring-purple-300 dark:border-slate-600 dark:bg-slate-800 dark:focus:border-orange-400 dark:focus:ring-orange-400 sm:py-3 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-2 mt-8">
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md border border-transparent bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus:outline-none dark:bg-orange-500 dark:hover:bg-orange-600"
                    >
                      Send Reward
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={isZapConfirmationOpen} as={Fragment}>
        <Dialog className="fixed z-50" open={isZapConfirmationOpen} onClose={() => setIsZapConfirmationOpen(false)}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="fixed w-full max-w-sm -translate-y-1/4 transform rounded-lg bg-slate-50 p-6 text-base font-semibold shadow-xl dark:bg-slate-800 md:max-w-md">
                <button
                  onClick={() => setIsZapConfirmationOpen(false)}
                  className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center text-slate-500 outline-none hover:text-slate-600 hover:dark:text-slate-300"
                >
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="flex items-center justify-center pb-4 text-xl">
                  {isZapSuccess ? <Dialog.Title>Success</Dialog.Title> : <Dialog.Title>Failed</Dialog.Title>}
                </div>
                {isZapSuccess ? (
                  <h4 className="flex items-center justify-center gap-2 rounded-md bg-green-100 py-4 text-center text-lg text-green-300 dark:bg-green-400/25">
                    <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    {`You sent ${tippedAmount} sats!`}
                  </h4>
                ) : (
                  <h4 className="flex items-center justify-center gap-2 rounded-md bg-red-100 py-4 text-center text-lg text-red-300 dark:bg-red-400/25">
                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                    {`Transaction failed!`}
                  </h4>
                )}
                {isZapSuccess && (
                  <h5 className="text overflow-x-scroll rounded-md py-4 text-center">
                    <div className="flex w-full cursor-text items-center justify-start rounded-md bg-slate-100 dark:bg-slate-700">
                      <div className="mr-2 whitespace-nowrap py-2 pl-2">Payment Hash:</div>
                      <div className="whitespace-nowrap rounded-md bg-slate-100 py-4 pr-4 dark:bg-slate-700">{paymentHash}</div>
                    </div>
                  </h5>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
