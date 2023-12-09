"use client";

import { Fragment, useState } from "react";

import { usePostRelayStore } from "@/app/stores/postRelayStore";
import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { Dialog, Transition } from "@headlessui/react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { type Event, getEventHash, getSignature } from "nostr-tools";

import { getTagValues } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

interface PropTypes {
  bountyEvent: Event;
}

export default function Applybutton({ bountyEvent }: PropTypes) {
  const { relayUrl, publish } = useRelayStore();
  const { setApplicantEvent } = useBountyEventStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { getActivePostRelayURLs } = usePostRelayStore();

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  };

  const handleApply = async (e: any) => {
    e.preventDefault();

    let event: Event = {
      id: "",
      sig: "",
      kind: 8050,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["d", getTagValues("d", bountyEvent.tags)],
        ["p", bountyEvent.pubkey],
        ["description", JSON.stringify(bountyEvent)],
      ],
      content: message,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    function onSeen() {
      setOpen(false);
      setApplicantEvent(relayUrl, getTagValues("d", bountyEvent.tags), userPublicKey, event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-x-2 rounded-lg bg-indigo-500 px-2 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        <UserPlusIcon className="h-5 w-5" />
        Apply
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-800 dark:bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="text-start">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
                      Apply to Bounty
                    </Dialog.Title>

                    <p className="pt-8 text-base text-gray-500 dark:text-gray-400">
                      {"You're application will be sent to the bounty creator for review."}
                    </p>

                    {/* TODO: do some math for the reward */}
                    <div className="mt-4 flex items-center gap-x-1">
                      <span className="text-gray-500 dark:text-gray-200">Reward:</span>
                      <div className="flex items-center">
                        <div className="text-bitcoin">
                          <SatoshiV2Icon style={{ height: "1.2rem", width: "1.2rem" }} />
                        </div>
                        <span className="text-bitcoin">{parseInt(getTagValues("reward", bountyEvent.tags)).toLocaleString()}</span>
                      </div>
                    </div>

                    <h2 className="pt-8 font-semibold text-gray-800 dark:text-gray-100">Message</h2>
                    <textarea
                      // type="text"
                      value={message}
                      onChange={handleMessageChange}
                      className="mt-4 w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-darkBorder dark:bg-darkFormFieldBackground dark:text-gray-100"
                      placeholder="I would like to apply to this bounty because..."
                    />
                  </div>
                  <div className="mt-5 flex justify-end sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={handleApply}
                    >
                      Send Application
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
