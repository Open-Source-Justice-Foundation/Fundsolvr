"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { Dialog, Transition } from "@headlessui/react";
import { type Event, getEventHash, getSignature } from "nostr-tools";

import { useBountyEventStore } from "../stores/eventStore";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

interface Props {
  eventId: string;
  onDelete?: Function;
}
export default function DeleteBounty({ eventId, onDelete }: Props) {
  const { getUserPublicKey, userPrivateKey } = useUserProfileStore();
  const { deleteBountyEvent, deleteUserEvent } = useBountyEventStore();
  const { publish, relayUrl } = useRelayStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const { getActivePostRelayURLs } = usePostRelayStore();
  const onSeen = () => {
    deleteBountyEvent(relayUrl, eventId);
    deleteUserEvent(relayUrl, eventId);
    if (onDelete) {
      onDelete();
    }
  };

  function closeModal(e: any) {
    setIsOpen(false);
  }

  function openModal(e: any) {
    e.stopPropagation();
    setIsOpen(true);
  }

  async function handleDelete(e: any) {
    e.stopPropagation();

    setIsOpen(true);

    let event: Event = {
      id: "",
      sig: "",
      kind: 5,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["e", eventId]],
      content: message || "",
      pubkey: getUserPublicKey(),
    };

    event.id = getEventHash(event);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
    closeModal(e);
  }
  return (
    <>
      <div
        onClick={openModal}
        className="flex cursor-pointer items-center justify-center rounded-lg bg-red-300/10 p-2 text-sm text-red-500 hover:bg-red-400/20"
      >
        Remove
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal} initialFocus={inputRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-gray-800 dark:bg-opacity-75" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-900">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Remove Bounty
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Include an optional note describing the reason for deletion</p>
                  </div>
                  <div className="sm:col-span-4">
                    <div className="mt-4">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 dark:ring-gray-600 sm:max-w-md">
                        <input
                          type="text"
                          name="message"
                          id="message"
                          autoComplete="off"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-darkFormFieldBackground dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                          placeholder="Note"
                          value={message}
                          ref={inputRef}
                          onChange={(e) => {
                            setMessage(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-red-400 hover:bg-red-300/10"
                      onClick={handleDelete}
                    >
                      Remove Bounty
                    </button>
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
