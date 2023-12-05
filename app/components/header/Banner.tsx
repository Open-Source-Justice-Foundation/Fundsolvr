"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import hero from "public/hero.png";

export default function Banner() {
  const router = useRouter();
  function navigateToCreate() {
    router.push("/create");
  }

  return (
    <div className="relative flex h-80 max-h-80 items-center justify-center overflow-hidden px-4">
      <div className="flex w-full max-w-4xl flex-col items-start justify-center space-y-5 text-white">
        <div className="mr-auto flex max-w-2xl flex-col items-start space-y-5 ">
          <h2 className="text-2xl text-white md:text-4xl md:leading-11">Bitcoin native escrow and dispute resolution for FOSS bounties</h2>
          <button
            onClick={navigateToCreate}
            className="flex items-center gap-x-2 rounded-3xl bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 "
          >
            Post a Bounty
          </button>
        </div>
      </div>
      <div className="-z-10">
        <Image
          alt="banner image"
          style={{
            objectFit: "cover",
          }}
          src={hero}
          sizes="100vw"
          layout="fill"
          objectPosition="top"
        />
      </div>
    </div>
  );
}
