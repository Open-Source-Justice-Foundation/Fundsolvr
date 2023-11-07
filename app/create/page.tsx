"use client";

import React, { useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { XMarkIcon } from "@heroicons/react/24/outline";
import MarkdownIt from "markdown-it";
import { getEventHash, getSignature, nip19 } from "nostr-tools";
import type { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";

import { createUniqueUrl, getTagValues } from "../lib/utils";
import { useBountyEventStore } from "../stores/eventStore";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import BountyTags from "./BountyTags";
import "./markdown-editor.css";

const mdParser = new MarkdownIt(/* Markdown-it options */);

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: true,
});

export default function CreateBounty() {
  const { publish, relayUrl } = useRelayStore();
  const { userPublicKey, userPrivateKey } = useUserProfileStore();
  const { setCachedBountyEvent, getBountyEvents, setBountyEvents } = useBountyEventStore();

  // TODO: use this
  const { postRelays } = usePostRelayStore();

  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [rewardError, setRewardError] = useState("");
  const [content, setContent] = useState("## Problem Description\n\n## Acceptance Criteria\n\n## Additional Information\n\n");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<Array<string>>([]);
  const [isSocialNoteChecked, setIsSocialNoteChecked] = useState(false);
  const { getActivePostRelayURLs } = usePostRelayStore();

  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  const handleRewardChange = (event: any) => {
    const inputValue = event.target.value;

    // Check if the input is a positive integer (non-decimal and non-negative)
    if (/^\d+$/.test(inputValue) || inputValue === "") {
      setReward(inputValue);
      setRewardError("");
    } else {
      setRewardError("Invalid input. Only positive whole numbers allowed.");
    }
  };

  function handleEditorChange({ html, text }: any) {
    setContent(text);
  }

  const handleSocialNoteCheckboxChange = (e: any) => {
    setIsSocialNoteChecked(e.target.checked);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeBounty = (event: Event) => {
    const identifier = getTagValues("d", event.tags);

    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: event.pubkey,
      kind: 30050,
      relays: [relayUrl],
    };

    setCachedBountyEvent(event);
    router.push("/b/" + nip19.naddrEncode(addressPointer));

    setBountyEvents(relayUrl, [event].concat(getBountyEvents(relayUrl)));
  };

  const addTag = () => {
    if (tags.includes(tagInput)) {
      setTagInput("");
      return;
    }
    if (tagInput === "") {
      return;
    }
    if (tagInput.length > 12) {
      alert("Tag must be less than 12 characters.");
      return;
    }
    if (tagInput.includes(" ")) {
      alert("Tag cannot contain spaces.");
      return;
    }
    if (tags.length > 4) {
      alert("You can only have 5 tags.");
      return;
    }
    setTags(tags.concat([tagInput]));
    setTagInput("");
  };

  const publishTextNote = async (identifier: string, tags: any, publicKey: string) => {
    const addressPointer: AddressPointer = {
      identifier: identifier,
      pubkey: publicKey,
      kind: 30050,
      relays: [relayUrl],
    };

    let event: Event = {
      id: "",
      sig: "",
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      // TODO: use this when clients support 30050 events
      // content: `Check out my bounty at resolvr.io: nostr:${nip19.naddrEncode(addressPointer)}`,
      content: `Check out my bounty at https://resolvr.io/b/${nip19.naddrEncode(addressPointer)}`,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      // TODO: should check if nostr is connected
      event = await window.nostr.signEvent(event);
    }

    function onSeen() {}

    publish(getActivePostRelayURLs(), event, onSeen);
  };

  const handlePublish = async () => {
    if (!userPublicKey) {
      alert("Please login to create a bounty.");
      return;
    }

    if (Number(reward) < 1) {
      alert("Please enter a reward greater than 0.");
      return;
    }

    if (title === "") {
      alert("Please enter a title.");
      return;
    }

    if (content === "") {
      alert("Please enter content.");
      return;
    }

    const uniqueUrl = createUniqueUrl(title, userPublicKey);

    const initialTags: Array<any> = [];

    const additionaltags = [
      ["d", uniqueUrl],
      ["title", title],
      ["s", "open"],
      ["reward", reward],
      ["c", "sats"],
    ];

    tags.forEach((tag) => {
      additionaltags.push(["t", tag]);
    });

    const allTags = initialTags.concat(additionaltags);

    let event: Event = {
      id: "",
      sig: "",
      kind: 30050,
      created_at: Math.floor(Date.now() / 1000),
      tags: allTags,
      content: content,
      pubkey: userPublicKey,
    };

    event.id = getEventHash(event);
    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    const ttags = tags.map((tag) => {
      return ["t", tag];
    });

    function onSeen() {
      if (isSocialNoteChecked) {
        publishTextNote(uniqueUrl, ttags, userPublicKey);
      }
      routeBounty(event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
  };

  return (
    <main className="mx-auto max-w-3xl pb-24 pt-10">
      {mounted && userPublicKey ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Bounty</h1>
          <div className="mt-8">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Title</h2>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="mt-4 w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Bounty title"
            />
            <h2 className="pb-4 pt-8 font-semibold text-gray-800 dark:text-gray-100">Content</h2>
            <MdEditor
              value={content}
              config={{
                view: {
                  menu: true,
                  md: true,
                  html: false,
                },
              }}
              style={{
                width: "100%",
                height: "500px",
              }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
            />

            <h2 className="pt-8 font-semibold text-gray-800 dark:text-gray-100">Tags</h2>
            <div className="pt-4">
              <BountyTags tags={tags} setTags={setTags} />
            </div>

            <div className="mt-4 flex gap-x-4">
              <span className="my-2 flex items-center gap-x-2 rounded-lg text-sm font-medium dark:text-gray-300">Selected:</span>
              <div className="flex gap-x-4 overflow-x-auto">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-x-2 rounded-lg border border-indigo-500 px-2 py-1 text-sm font-medium text-gray-700 dark:border-indigo-600 dark:text-white"
                  >
                    {tag}
                    <button
                      onClick={() => {
                        setTags(tags.filter((t) => t !== tag));
                      }}
                    >
                      <XMarkIcon className="h-4 w-4 rounded-full hover:bg-red-500" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="pt-8 font-semibold text-gray-800 dark:text-gray-100">Reward</h2>
            <input
              type="number"
              value={reward}
              onChange={handleRewardChange}
              className="mt-4 w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Value in sats"
              min="1"
              step="1"
            />
            <div className="relative mb-2 mt-8 flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="socialnote"
                  aria-describedby="social-note"
                  name="socialnote"
                  type="checkbox"
                  onChange={handleSocialNoteCheckboxChange}
                  checked={isSocialNoteChecked}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-900"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="socialnote" className="font-medium text-gray-900 dark:text-gray-100">
                  Post Social Note
                </label>
                <p id="comments-description" className="text-gray-500 dark:text-gray-300">
                  Post a note to your profile to let your followers know about your bounty.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                className="flex items-center gap-x-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                onClick={handlePublish}
              >
                Create Bounty
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-20 flex justify-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Please login to create a bounty.</h1>
        </div>
      )}
    </main>
  );
}
