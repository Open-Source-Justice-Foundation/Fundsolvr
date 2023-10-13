"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChevronLeftIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid";

import Avatar from "../components/Avatar";
import ChatBubble from "../components/ChatBubble";
import ContactMenuButton from "../components/ContactMenuButton";

const ChatPage = () => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center border-b border-b-gray-600">
        <div className="flex w-full items-center gap-4 p-2 pb-4">
          <button onClick={() => router.back()} className="rounded p-1 transition-colors hover:bg-gray-700">
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <Link href={`/u/npub`} className="group flex flex-1 items-center gap-4">
            <Avatar src="https://www.chrisatmachine.com/assets/headshot.jpg" verified />
            <div className="flex flex-col gap-1">
              <h2 className="text-md font-bold group-hover:underline">Christian Chiarulli</h2>
              <p className="text-gray-400">✨ Designing, building and talking about digital products.</p>
            </div>
          </Link>
          <ContactMenuButton />
        </div>
      </div>
      <div className="flex h-full max-h-[66vh] flex-col items-center gap-4 overflow-auto p-4">
        <span className="py-2 text-xs text-gray-400">Yesterday at 1:02 PM</span>
        <ChatBubble rtl text="Lorem! 👋" />
        <ChatBubble
          rtl
          text="Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis."
        />
        <span className="py-2 text-xs text-gray-400">Today at 11:16 AM</span>
        <ChatBubble text="Lorem 👀" />
        <ChatBubble text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore, dolorem? 🤔" />
        <ChatBubble text="Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia." />
        <ChatBubble rtl text="Lorem ipsum dolor sit amet 🎃" />
      </div>
      <div className="flex items-center gap-4 p-4">
        <div className="flex-1 rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
          <input
            type="text"
            className="w-full border-0 bg-transparent px-4 py-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Your Message"
          />
        </div>
        <button className="rounded-md bg-white/5 p-2 ring-1 ring-inset ring-white/10 transition-colors hover:ring-2 hover:ring-indigo-500">
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default ChatPage;
