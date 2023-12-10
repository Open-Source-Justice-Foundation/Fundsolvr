"use client";

import { useEffect, useState } from "react";

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { type Event, Filter, getSignature, nip19 } from "nostr-tools";
import { Octokit } from "octokit";

import { getITagValues, shortenHash, verifyGithub } from "../lib/utils";
import Avatar from "../messages/components/Avatar";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import { Profile } from "../types";

interface Props {
  publicKey?: string;
  privateKey?: string;
}

export default function BackupKeys({ publicKey, privateKey }: Props) {
  const { userPrivateKey, userPublicKey } = useUserProfileStore();
  const [privateKeyCopyText, setPrivateKeyCopyText] = useState("Copy");
  const [publicKeyCopyText, setPublicKeyCopyText] = useState("Copy");

  const copyTextToClipboard = async (text: string) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }
  };

  return (
    <div className="flex flex-col gap-4 font-['Avenir']">
      <label htmlFor="publickey" className="flex font-medium text-gray-900 dark:text-gray-100">
        Public Key
      </label>
      <div className="relative">
        <input
          type="text"
          name="publickey"
          id="publickey"
          spellCheck="false"
          value={publicKey ? nip19.npubEncode(publicKey) : nip19.npubEncode(userPublicKey)}
          onChange={(e) => e.preventDefault()}
          onClick={async () => {
            await copyTextToClipboard(publicKey ? nip19.npubEncode(publicKey) : nip19.npubEncode(userPublicKey));
            setPublicKeyCopyText("Copied");
            setPrivateKeyCopyText("Copy");
          }}
          className="w-full cursor-pointer rounded border border-gray-300 p-2 caret-transparent dark:border-darkBorder dark:bg-gray-600 dark:text-gray-100"
        />

        <div className="right-0 top-0 flex h-full w-full items-center justify-center lg:absolute lg:items-end lg:justify-end">
          <button
            onClick={async () => {
              await copyTextToClipboard(publicKey ? nip19.npubEncode(publicKey) : nip19.npubEncode(userPublicKey));
              setPublicKeyCopyText("Copied");
              setPrivateKeyCopyText("Copy");
            }}
            className="flex h-full w-full items-center justify-center px-4 py-2 active:translate-y-1 dark:text-white hover:dark:text-gray-300 lg:justify-end lg:py-0"
          >
            {publicKeyCopyText}
          </button>
        </div>
      </div>
      <label htmlFor="privatekey" className="flex font-medium text-gray-900 dark:text-gray-100">
        Private Key
      </label>
      <div className="relative">
        <input
          type="password"
          name="privatekey"
          id="privatekey"
          spellCheck="false"
          value={privateKey ? nip19.nsecEncode(privateKey) : nip19.nsecEncode(userPrivateKey)}
          onClick={async () => {
            await copyTextToClipboard(privateKey ? nip19.nsecEncode(privateKey) : nip19.nsecEncode(userPrivateKey));
            setPrivateKeyCopyText("Copied");
            setPublicKeyCopyText("Copy");
          }}
          onChange={(e) => e.preventDefault()}
          className="w-full cursor-pointer rounded border border-gray-300 p-2 caret-transparent dark:border-darkBorder dark:bg-gray-600 dark:text-gray-100"
        />
        <div className="right-0 top-0 flex h-full w-full items-center justify-center lg:absolute lg:items-end lg:justify-end">
          <button
            onClick={async () => {
              await copyTextToClipboard(privateKey ? nip19.nsecEncode(privateKey) : nip19.nsecEncode(userPrivateKey));
              setPrivateKeyCopyText("Copied");
              setPublicKeyCopyText("Copy");
            }}
            className="flex h-full w-full items-center justify-center px-4 py-2 active:translate-y-1 dark:text-white hover:dark:text-gray-300 lg:justify-end lg:py-0"
          >
            <span>{privateKeyCopyText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
