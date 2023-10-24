"use client";

import React, { useState } from "react";

import dynamic from "next/dynamic";

import MarkdownIt from "markdown-it";
import { getEventHash } from "nostr-tools";
import type { Event } from "nostr-tools";

import { createUniqueUrl } from "../lib/utils";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import "./markdown-editor.css";

const mdParser = new MarkdownIt(/* Markdown-it options */);

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: true,
});

export default function CreateBounty() {
  const { publish, relayUrl } = useRelayStore();
  const { getUserPublicKey } = useUserProfileStore();

  // TODO: use this
  const { postRelays } = usePostRelayStore();

  const [title, setTitle] = useState("");
  const [reward, setReward] = useState("");
  const [content, setContent] = useState("");

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  const handleRewardChange = (event: any) => {
    setReward(event.target.value);
  };

  function handleEditorChange({ html, text }: any) {
    setContent(text);
  }

  const handlePublish = async () => {
    console.log("handlePublish", title, reward, content);

    const uniqueUrl = createUniqueUrl(title);

    // TODO: handle tags
    const initialTags: Array<any> = [];

    const additionaltags = [
      ["d", uniqueUrl],
      ["title", title],
      ["status", "open"],
      ["value", reward],
    ];

    const tags = initialTags.concat(additionaltags);

    let event: Event = {
      id: "",
      sig: "",
      kind: 30050,
      created_at: Math.floor(Date.now() / 1000),
      tags: tags,
      content: content,
      pubkey: getUserPublicKey(),
    };

    event.id = getEventHash(event);
    event = await window.nostr.signEvent(event);

    publish([relayUrl], event);
  };

  return (
    <main className="mx-auto max-w-3xl pb-24 pt-10">
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

          <h2 className="pt-8 font-semibold text-gray-800 dark:text-gray-100">Reward (sats)</h2>
          <input
            type="text"
            value={reward}
            onChange={handleRewardChange}
            className="mt-4 w-full rounded border border-gray-300 bg-white p-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Value in sats"
          />
          {/* TODO: handle tags */}
          {/* <h2 className="text-gray-100 pt-8">Tags</h2> */}
          {/* <input */}
          {/*   type="text" */}
          {/*   value={inputValue} */}
          {/*   onChange={handleInputChange} */}
          {/*   className="mt-4 w-full rounded border border-gray-600 bg-gray-700 text-gray-100 p-2" */}
          {/*   placeholder="Comma separated tags" */}
          {/* /> */}
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
    </main>
  );
}
