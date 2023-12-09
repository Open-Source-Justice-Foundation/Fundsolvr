"use client";

import { Tab } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/20/solid";

import { classNames } from "../lib/utils";
import Badge from "./components/Badge";
import Contact, { IUser } from "./components/Contact";

const USERS: IUser[] = [
  {
    profile: "https://www.chrisatmachine.com/assets/headshot.jpg",
    name: "Christian Chiarulli",
    unread: true,
    about: "✨ Designing, building and talking about digital products.",
    publicKey: "npub",
  },
  {
    profile: "https://cdnb.artstation.com/p/assets/images/images/043/120/123/large/wizix-nakamoto-master-full.jpg?1636383169",
    name: "satoshi",
    unread: true,
    about: "✨ Designing, building and talking about digital products.",
    publicKey: "npub",
  },
  {
    profile: "https://pfp.nostr.build/6838p.jpeg",
    name: "Snowden",
    unread: false,
    about: "✨ Designing, building and talking about digital products.",
    publicKey: "npub",
  },
  {
    profile: "https://void.cat/d/MreaerC65YkE8zeHvVv6XM.webp",
    name: "NVK",
    unread: false,
    about: "✨ Designing, building and talking about digital products.",
    publicKey: "npub",
  },
  {
    profile: "https://imgproxy.coracle.social/x/s:280:280/aHR0cHM6Ly9maWF0amFmLmNvbS9zdGF0aWMvZmF2aWNvbi5qcGc=",
    name: "fiatjaf",
    unread: false,
    about: "✨ Designing, building and talking about digital products.",
    publicKey: "npub",
  },
];

const TABS = [
  {
    title: "Conversations",
    unread: 2,
  },
  {
    title: "Requests",
    unread: 1,
  },
];

export default function MessagesPage() {
  return (
    <Tab.Group>
      <Tab.List className="flex items-center border-b border-b-gray-400 dark:border-b-gray-600">
        {TABS.map(({ title, unread }) => (
          <Tab
            key={title}
            className={({ selected }) =>
              classNames(
                `flex items-center gap-2 rounded-t-md border-x border-t p-4`,
                selected ? "border-gray-400 focus:outline-none dark:border-darkBorder" : "border-transparent"
              )
            }
          >
            <span>{title}</span>
            <Badge content={unread} />
          </Tab>
        ))}
        <div className="flex flex-1 justify-end">
          <button className="flex items-center gap-x-2 rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            New Message
          </button>
        </div>
      </Tab.List>
      <Tab.Panels className="mt-4 flex list-none flex-col gap-4">
        <Tab.Panel>
          {USERS.map((user, idx) => (
            <Contact key={idx} user={user} />
          ))}
        </Tab.Panel>
        <Tab.Panel>
          {USERS.slice(1, 3).map((user, idx) => (
            <Contact key={idx} user={user} />
          ))}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
