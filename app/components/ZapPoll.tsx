"use client";

import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Dialog, Transition } from "@headlessui/react";
import { ListBulletIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import "@heroicons/react/24/outline";
import { getPublicKey, nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";

import { useBountyEventStore } from "../stores/eventStore";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

interface Props {
  Icon?: React.FC<any>;
  event?: Event;
}

type Base64 = string;
interface PollEvent extends Event {
  ots: Base64;
}
// Button to create poll
// Button pops open modal on click
// Modal has options to make a poll
// Publish the poll event
// Route to the poll nevent1 URL

export default function ZapPoll({ Icon, event }: Props) {
  // console.log(event);
  const router = useRouter();
  const { getUserPublicKey } = useUserProfileStore();
  const [inputCount, setInputCount] = useState(2);
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [pollContent, setPollContent] = useState("");
  const [satoshiAmount, setSatoshiAmount] = useState("");
  const [consensusThreshold, setConsensusThreshold] = useState("");
  const [closedAt, setClosedAt] = useState("");
  const [eventId, setEventId] = useState(event?.id || "");
  // const [recipientId, setRecipientId] = useState("");
  const [recipientOptionCount, setRecipientOptionCount] = useState(1);
  const [recipientAddresses, setRecipientAddresses] = useState<string[]>([getUserPublicKey()]);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showRecipientDeleteButton, setShowRecipientDeleteButton] = useState(false);
  const { getActivePostRelayURLs } = usePostRelayStore();

  const { deleteBountyEvent, deleteUserEvent } = useBountyEventStore();
  const { publish, subscribe, relayUrl } = useRelayStore();
  const [isOpen, setIsOpen] = useState(false);
  const pollContentRef = useRef(null);
  const onSeen = (event: Event) => {
    routePoll(event);
  };

  function closeModal(e: any) {
    setIsOpen(false);
    setPollOptions([]);
    setPollContent("");
    setInputCount(2);
    setShowDeleteButton(false);
    setSatoshiAmount("");
    setConsensusThreshold("");
    setClosedAt("");
    setRecipientOptionCount(1);
    setRecipientAddresses([]);
    setShowRecipientDeleteButton(false);
  }

  function openModal(e: any) {
    e.stopPropagation();
    setIsOpen(true);
  }

  function handleAddField(e: any) {
    e.preventDefault();
    setInputCount(inputCount + 1);
    setShowDeleteButton(true);
  }

  function handleDeleteField(e: any) {
    e.preventDefault();
    const count = inputCount - 1;
    setInputCount(count);
    if (count <= 2) {
      setShowDeleteButton(false);
    }
  }

  function handleAddZapRecipient(e: any) {
    e.preventDefault();
    setRecipientOptionCount(recipientOptionCount + 1);
    setShowRecipientDeleteButton(true);
  }

  function handleDeleteZapRecipient(e: any) {
    e.preventDefault();
    const count = recipientOptionCount - 1;
    setRecipientOptionCount(count);
    if (count <= 1) {
      setShowRecipientDeleteButton(false);
    }
  }

  const routePoll = (event: Event) => {
    const eventPointer: EventPointer = {
      id: event.id,
      author: getUserPublicKey(),
      kind: 6969,
      relays: [relayUrl],
    };
    router.push("/poll/" + nip19.neventEncode(eventPointer));
  };

  async function handlePublish(e: any) {
    e.stopPropagation();
    // console.log(pollOptions);
    // setIsOpen(true);
    const tags = pollOptions.map((option, index) => {
      return ["poll_option", index.toString(), option];
    });

    const amount = satoshiAmount ? satoshiAmount.toString() : "0";

    tags.push(
      ["value_maximum", amount],
      ["value_minimum", amount],
      ["consensus_threshold", consensusThreshold.toString()],
      ["closed_at", Math.floor(new Date(closedAt).getTime() / 1000).toString()]
    );

    if (eventId.length === 64) {
      // TODO: Better validation in the form
      tags.push(["e", eventId, relayUrl]);
    }

    if (recipientAddresses.length) {
      const pTags = recipientAddresses.map((recipient, index) => {
        return ["p", recipient, relayUrl];
      });
      tags.push(...pTags);
    }
    // console.log("tags", tags);

    // TODO:
    // * implement OTS field
    // * Implement Zap Recipient fields + p tags
    // * implement: p tags

    let event: PollEvent = {
      id: "",
      sig: "",
      kind: 6969,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: pollContent || "",
      pubkey: getUserPublicKey(),
      ots: "",
    };

    event = await window.nostr.signEvent(event);
    publish(getActivePostRelayURLs(), event, onSeen);
    // closeModal(e);
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex cursor-pointer items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-400"
      >
        {Icon ? <Icon className="h-5 w-5"></Icon> : <ListBulletIcon className="mr-2 h-5 w-5" />}
        Poll
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal} initialFocus={pollContentRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Poll
                  </Dialog.Title>
                  <div>
                    <div className="mt-6">
                      <p className="text-sm text-gray-500">Write the poll</p>
                    </div>
                    <textarea
                      ref={pollContentRef}
                      value={pollContent}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6  "
                      name="pollContent"
                      onChange={(e) => {
                        setPollContent(e.target.value);
                      }}
                    />
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">Include at least two options for the poll</p>
                  </div>
                  <div className="sm:col-span-4">
                    <div className="mt-2">
                      <div className="shadow-sm0 flex-row rounded-md sm:max-w-md">
                        {Array.from({ length: inputCount }).map((e, i) => {
                          return (
                            <input
                              key={i}
                              type="text"
                              name="message"
                              id={`pollField-${i}`}
                              autoComplete="off"
                              className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                              placeholder={`Option ${i + 1}`}
                              value={pollOptions[i] || ""}
                              // ref={inputRef}
                              onChange={(e) => {
                                const updatedOptions = [...pollOptions];
                                updatedOptions[i] = e.target.value;
                                setPollOptions(updatedOptions);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button onClick={handleAddField} className="h-6 w-6">
                      <PlusCircleIcon></PlusCircleIcon>
                    </button>
                    {showDeleteButton && (
                      <button onClick={handleDeleteField} className="h-6 w-6">
                        <MinusCircleIcon></MinusCircleIcon>
                      </button>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">A value in satoshis to be paid to vote in the poll</p>
                    <input
                      type="number"
                      className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      autoComplete="off"
                      name="satoshis"
                      min="0"
                      placeholder="Value in satoshis"
                      value={satoshiAmount}
                      onKeyDown={(evt) => {
                        ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault();
                        satoshiAmount === "" && evt.keyCode === 9 && setSatoshiAmount("0");
                      }}
                      onChange={(e) => {
                        if (e.target.value !== "") {
                          const amount = window.parseInt(e.target.value);
                          if (!isNaN(amount)) {
                            setSatoshiAmount(e.target.value);
                          } else {
                            setSatoshiAmount("");
                          }
                        } else {
                          setSatoshiAmount("");
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">Required percentage to attain consensus</p>
                    <input
                      type="number"
                      className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      autoComplete="off"
                      name="threshold"
                      placeholder="0 - 100"
                      max="100"
                      // min="1"
                      step="1"
                      value={consensusThreshold}
                      onKeyDown={(evt) => {
                        ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault();
                        consensusThreshold === "" && evt.keyCode === 9 && setConsensusThreshold("51");
                      }}
                      onChange={(e) => {
                        // setConsensusThreshold(threshold);
                        if (e.target.value !== "") {
                          const threshold = window.parseInt(e.target.value);
                          if (threshold > 100) {
                            setConsensusThreshold("100");
                          } else if (threshold < 1) {
                            setConsensusThreshold("1");
                          } else {
                            setConsensusThreshold(e.target.value);
                          }
                        } else {
                          setConsensusThreshold("");
                        }
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">A date in the future when the poll closes</p>
                    <input
                      type="datetime-local"
                      className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      autoComplete="off"
                      name="closed_at"
                      // min={() => new Date(Date.now()).toLocaleString()}
                      placeholder="A date when the poll is closed"
                      value={closedAt}
                      onChange={(e) => {
                        const date = e.target.value;
                        // console.log(date);
                        setClosedAt(date);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">Which Event is this for?</p>
                    <input
                      type="text"
                      className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      autoComplete="off"
                      name="eventId"
                      value={eventId}
                      placeholder="Enter an Event ID"
                      onChange={(e) => {
                        setEventId(e.target.value);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">Recipient(s) of the Zap</p>
                    {Array.from({ length: recipientOptionCount }).map((recipient, i) => (
                      <input
                        key={i}
                        type="text"
                        className="mb-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                        autoComplete="off"
                        name="zapRecipient"
                        placeholder={`Address ${i + 1}`}
                        value={recipientAddresses[i] || ""}
                        // ref={inputRef}
                        onChange={(e) => {
                          const updatedAddresses = [...recipientAddresses];
                          updatedAddresses[i] = e.target.value;
                          setRecipientAddresses(updatedAddresses);
                        }}
                      />
                    ))}
                    <div className="mt-4">
                      <button onClick={handleAddZapRecipient} className="h-6 w-6">
                        <PlusCircleIcon></PlusCircleIcon>
                      </button>
                      {showRecipientDeleteButton && (
                        <button onClick={handleDeleteZapRecipient} className="h-6 w-6">
                          <MinusCircleIcon></MinusCircleIcon>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex-row space-x-4">
                    <button onClick={handlePublish}>Publish</button>
                    <button onClick={closeModal}>Cancel</button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
