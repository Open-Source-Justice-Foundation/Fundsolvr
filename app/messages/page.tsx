"use client";

import { Tab } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/20/solid";

import { classNames } from "../lib/utils";
import Badge from "./components/Badge";
import Chat, { IUser } from "./components/Chat";

const USERS: IUser[] = [
  {
    img: "https://www.chrisatmachine.com/assets/headshot.jpg",
    username: "Christian Chiarulli",
    unread: true,
    bio: "✨ Designing, building and talking about digital products.",
  },
  {
    img: "https://cdnb.artstation.com/p/assets/images/images/043/120/123/large/wizix-nakamoto-master-full.jpg?1636383169",
    username: "satoshi",
    unread: true,
    bio: "✨ Designing, building and talking about digital products.",
  },
  {
    img: "https://pfp.nostr.build/6838p.jpeg",
    username: "Snowden",
    unread: false,
    bio: "✨ Designing, building and talking about digital products.",
  },
  {
    img: "https://void.cat/d/MreaerC65YkE8zeHvVv6XM.webp",
    username: "NVK",
    unread: false,
    bio: "✨ Designing, building and talking about digital products.",
  },
  {
    img: "https://imgproxy.coracle.social/x/s:280:280/aHR0cHM6Ly9maWF0amFmLmNvbS9zdGF0aWMvZmF2aWNvbi5qcGc=",
    username: "fiatjaf",
    unread: false,
    bio: "✨ Designing, building and talking about digital products.",
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
    <div className="pb-20 pt-10">
      <div className="mx-auto flex h-screen w-full items-start justify-center text-sm text-gray-900 antialiased dark:text-white">
        <div className="mx-auto w-full max-w-3xl rounded-md border border-gray-600 p-4">
          <Tab.Group>
            <Tab.List className="flex items-center border-b border-b-gray-600">
              {TABS.map(({ title, unread }) => (
                <Tab
                  key={title}
                  className={({ selected }) =>
                    classNames(
                      `flex items-center gap-2 rounded-t-md border-x border-t p-4`,
                      selected ? "border-gray-600 focus:outline-none" : "border-transparent"
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
                  <Chat key={idx} user={user} />
                ))}
              </Tab.Panel>
              <Tab.Panel>
                {USERS.slice(1, 3).map((user, idx) => (
                  <Chat key={idx} user={user} />
                ))}
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
