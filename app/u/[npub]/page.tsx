"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTagValues } from "@/app/lib/utils";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { nip19 } from "nostr-tools";
import { Event } from "nostr-tools";

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfile } = useProfileStore();
  const pathname = usePathname();
  let npub: string = "";
  if (pathname && pathname.length > 60) {
    npub = pathname.split("/").pop() || "";
    console.log("npub", npub);
  }

  return (
    <div className="lg:pl-72">
      <div className="mx-auto flex h-screen w-full items-start justify-center text-sm text-gray-900 antialiased dark:text-white">
        <div className="mx-auto w-full max-w-3xl rounded-md border border-gray-600 p-4">
          <div className="mt-4 flex gap-x-4 px-4 py-3">
            <img
              className="h-32 w-32 cursor-pointer rounded-full"
              src="https://cdnb.artstation.com/p/assets/images/images/043/120/123/large/wizix-nakamoto-master-full.jpg?1636383169"
            />
            <div className="flex flex-col gap-y-4 px-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Christian Chiarulli</h2>

                <div className="flex items-center gap-x-2">
                  <svg className="fill-green-400" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                  </svg>
                  <span className="text-lg text-green-400">verified</span>
                </div>
              </div>
              <span className="-mt-2 text-gray-500 dark:text-gray-400">chris@notebin.org</span>
              <span className="text-lg">✨ Designing, building and talking about digital products.</span>
              {/* <span className="text-lg">Bounties claimed: 0</span> */}
            </div>
          </div>
          <div>
            <div className="mx-8 my-8 flex justify-center gap-x-8 rounded-md border border-gray-600 px-4 py-4">
              <div className="flex items-center gap-x-4">
                <svg className="fill-gray-300/80" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>

                <svg className="fill-gray-300/80" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M17.9 17.39c-.26-.8-1.01-1.39-1.9-1.39h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41a7.984 7.984 0 0 1 2.9 12.8M11 19.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.22.21-1.79L9 15v1a2 2 0 0 0 2 2m1-16A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Z" />
                </svg>
              </div>

              <div className="flex items-center gap-x-2">
                <svg className="fill-gray-300/80" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                </svg>
                <span className="text-lg text-gray-300/80">United States 🍔</span>
              </div>

              <div className="flex items-center gap-x-1">
                <svg className="fill-gray-300/80" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M11 15H6l7-14v8h5l-7 14v-8Z" />
                </svg>
                <span className="text-lg text-gray-300/80">chrisatmachine@getalby.com</span>
              </div>
            </div>

            <div className="mx-8 my-8 flex justify-between gap-x-8 rounded-md py-4">
              <div className="rounded-md border border-gray-600 p-4">Bounties claimed: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Bounty Created: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Sats Earned: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Sats Spent: 0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
