"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getTagValues } from "@/app/lib/utils";
import { useProfileStore } from "@/app/stores/profileStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { CheckIcon, HandThumbUpIcon, PencilSquareIcon, UserIcon } from "@heroicons/react/20/solid";
import { nip19 } from "nostr-tools";
import { Event } from "nostr-tools";

const timeline = [
  {
    id: 1,
    content: "Applied to:",
    target: "Rewrite the documentation for the Nostr API",
    href: "#",
    date: "Sep 20",
    datetime: "2020-09-20",
    icon: UserIcon,
    iconBackground: "bg-orange-500",
  },
  {
    id: 2,
    content: "Blog post:",
    target: "Boost your conversion rate",
    href: "#",
    date: "Sep 22",
    datetime: "2020-09-22",
    icon: PencilSquareIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 3,
    content: "Completed bounty:",
    target: "Rewrite TempleOS in Rust",
    href: "#",
    date: "Sep 28",
    datetime: "2020-09-28",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
  {
    id: 4,
    content: "Blog post:",
    target: "Exploring BitVM",
    href: "#",
    date: "Sep 30",
    datetime: "2020-09-30",
    icon: PencilSquareIcon,
    iconBackground: "bg-blue-500",
  },
  {
    id: 5,
    content: "Completed bounty:",
    target: "Finish Resolvr.io",
    href: "#",
    date: "Oct 4",
    datetime: "2020-10-04",
    icon: CheckIcon,
    iconBackground: "bg-green-500",
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

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
    <div className="pb-20">
      <div className="mx-auto flex h-screen w-full items-start justify-center text-sm text-gray-900 antialiased dark:text-white">
        <div className="pt-10 mx-auto w-full max-w-4xl rounded-b-md border-x border-b border-gray-600 p-4">
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

            <div className="mx-8 my-8 flex justify-between gap-x-6 rounded-md">
              <div className="rounded-md border border-gray-600 p-4">Bounties claimed: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Bounties Created: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Sats Earned: 0</div>
              <div className="rounded-md border border-gray-600 p-4">Sats Spent: 0</div>
            </div>
            {/* <div className="mx-8 my-8 flex justify-between gap-x-8 rounded-md py-4"> */}
            {/*   <div className="rounded-md border border-gray-600 p-4">About</div> */}
            {/*   <div className="rounded-md border border-gray-600 p-4">Skill tags</div> */}
            {/*   <div className="rounded-md border border-gray-600 p-4">Services</div> */}
            {/* </div> */}

            <div className="flow-root px-16 pb-8 pt-8 border-t border-gray-600">
              <ul role="list" className="-mb-8">
                {timeline.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== timeline.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-700" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={classNames(
                              event.iconBackground,
                              "flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-gray-600"
                            )}
                          >
                            <event.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-300">
                              {event.content}{" "}
                              <a href={event.href} className="font-medium text-gray-100">
                                {event.target}
                              </a>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-300">
                            <time dateTime={event.datetime}>{event.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>


        </div>


      </div>
    </div>
  );
}
