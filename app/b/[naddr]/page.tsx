"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Script from "next/script";

import Applicant from "@/app/components/Applicant";
import Applybutton from "@/app/components/Applybutton";
import Discussion from "@/app/components/discussion/Discussion";
import BitcoinIcon from "@/app/components/icons/BitcoinIcon";
import { getApplicants, getZapRecieptFromRelay, retrieveProfiles } from "@/app/lib/nostr";
import { getBountyTags, getTagValues, parseProfileContent, shortenHash } from "@/app/lib/utils";
import Avatar from "@/app/messages/components/Avatar";
import { useBountyEventStore } from "@/app/stores/eventStore";
import { useProfileStore } from "@/app/stores/profileStore";
import { useReadRelayStore } from "@/app/stores/readRelayStore";
import { useRelayStore } from "@/app/stores/relayStore";
import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Filter, nip19 } from "nostr-tools";
import { Event } from "nostr-tools";
import { AddressPointer } from "nostr-tools/lib/nip19";
import colors, { indigo } from "tailwindcss/colors";

import * as NoComment from "../../../public/NoComment";
import DeleteBounty from "../../components/DeleteBounty";
import ZapPoll from "../../components/ZapPoll";
import { useUserProfileStore } from "../../stores/userProfileStore";
import { Theme } from "../../types";

export default function BountyPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const { getProfileEvent } = useProfileStore();
  const { cachedBountyEvent, setCachedBountyEvent, getBountyApplicants, getApplicantEvent, getZapReceiptEvent } = useBountyEventStore();
  const { getUserPublicKey, userPublicKey, userPrivateKey } = useUserProfileStore();
  const { readRelays, updateReadRelayStatus, sortReadRelays, setAllReadRelaysInactive } = useReadRelayStore();
  const NoCommentContainer = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [naddr, setNaddr] = useState<string>("");
  const [naddrPointer, setNaddrPointer] = useState<AddressPointer>();
  const [bountyEvent, setBountyEvent] = useState<Event>();
  const [tab, setTab] = useState<string>("details");

  const pathname = usePathname();
  let naddrStr: string = "";
  if (pathname && pathname.length > 60) {
    naddrStr = pathname.split("/").pop() || "";
  }

  useEffect(() => {
    if (naddrStr) {
      const naddr_data: any = nip19.decode(naddrStr).data;
      setNaddr(naddrStr);
      setNaddrPointer(naddr_data);

      if (naddrPointer) {
        if (cachedBountyEvent) {
          const dValues = new Set<string>();
          dValues.add(getTagValues("d", cachedBountyEvent.tags));
          getApplicants(dValues);
          setBountyEvent(cachedBountyEvent);
          return;
        }

        const onEvent = (event: any) => {
          setBountyEvent(event);
          retrieveProfiles([event.pubkey]);
          const dValues = new Set<string>();
          dValues.add(getTagValues("d", event.tags));
          getApplicants(dValues);
          setCachedBountyEvent(event);
        };

        const onEOSE = () => {};

        const filter: Filter = {
          kinds: [naddrPointer.kind],
          authors: [naddrPointer.pubkey],
          "#d": [naddrPointer.identifier],
        };

        console.log("filter", filter);

        if (naddrPointer.relays && naddrPointer.relays.length > 0) {
          subscribe([naddrPointer.relays[0]], filter, onEvent, onEOSE);
        } else {
          subscribe([relayUrl], filter, onEvent, onEOSE);
        }
      }
    }
  }, [naddr, cachedBountyEvent, relayUrl]);

  useEffect(() => {
    if (!cachedBountyEvent) {
      return;
    }
    // TODO: check value against bounty value
    if (!getZapReceiptEvent(relayUrl, cachedBountyEvent.id)) {
      getZapRecieptFromRelay(cachedBountyEvent);
    }

    const dValues = new Set<string>();
    dValues.add(getTagValues("d", cachedBountyEvent.tags));

    getApplicants(dValues);
  }, [cachedBountyEvent]);

  useEffect(() => {
    return () => {
      setCachedBountyEvent(null);
    };
  }, []);

  // TODO: Remove this when NoComment is replaced with something else
  // https://github.com/Resolvr-io/resolvr.io/issues/66
  useEffect(() => {
    let current = NoCommentContainer.current;
    const script = document.createElement("script");
    const naddr_data: any = nip19.decode(naddrStr).data;
    if (current) {
      script.src = "/NoComment.js";
      script.async = true;
      script.id = "nocomment";
      script.setAttribute("data-relays", JSON.stringify(naddr_data?.relays));
      script.setAttribute("data-custom-base", naddrStr);
      script.setAttribute("data-owner", nip19.npubEncode(userPublicKey));
    }
    current?.appendChild(script);

    return () => {
      current?.removeChild(script);
    };
  }, [bountyEvent, tab]);

  function setupMarkdown(content: string) {
    var md = require("markdown-it")();
    var result = md.render(content || "");
    return result;
  }

  const markdown = setupMarkdown(bountyEvent?.content || "");

  function classNames(...classes: any) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="px-4 pb-20 pt-4">
      {bountyEvent && (
        <>
          <div className="mx-auto flex max-w-screen-xl flex-col">
            <div className="mx-auto flex w-full flex-row justify-between">
              <Link
                href={`/`}
                className="flex w-48 items-center gap-x-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 shadow-lg shadow-gray-900/5 ring-1 ring-gray-300 hover:bg-white dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-gray-700/50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to all Bounties
              </Link>
              {userPublicKey && bountyEvent.pubkey !== userPublicKey && (
                <>
                  {
                    // TODO: check if user has already applied
                    getApplicantEvent(relayUrl, getTagValues("d", bountyEvent.tags), userPublicKey) ? (
                      <span className="select-none text-green-500 dark:text-green-400">Applied</span>
                    ) : (
                      <Applybutton bountyEvent={bountyEvent} />
                    )
                  }
                </>
              )}
              {userPublicKey && bountyEvent.pubkey === userPublicKey && <ZapPoll event={bountyEvent} />}
            </div>
            <div className="flex flex-col gap-6 pb-3">
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-3xl text-white"></div>
              </div>

              <div>
                <h2 className="mb-4 text-2xl text-gray-900 dark:text-white">{getTagValues("title", bountyEvent.tags)}</h2>

                <div className="flex justify-between">
                  <div className="flex gap-x-2">
                    {bountyEvent?.pubkey && naddrPointer && (
                      <>
                        {bountyEvent.pubkey === getUserPublicKey() && (
                          <>
                            <DeleteBounty
                              eventId={bountyEvent.id}
                              onDelete={() => {
                                router.back();
                              }}
                            ></DeleteBounty>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto flex max-w-screen-xl flex-col gap-x-16 md:flex-row">
            <div className="flex w-full flex-col">
              <div className="flex divide-x divide-gray-600 border-b border-gray-600 px-2 pb-6 pt-4 dark:text-gray-400">
                <div
                  onClick={() => setTab("details")}
                  className={classNames(
                    tab === "details"
                      ? "text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
                      : "hover:text-gray-700 dark:hover:text-gray-200",
                    "flex cursor-pointer select-none items-center gap-x-2 pr-2 hover:text-indigo-600 dark:border-gray-700 dark:hover:text-gray-100"
                  )}
                >
                  <BookOpenIcon className="h-5 w-5" />
                  <h3 className="">Details</h3>
                </div>
                <div
                  onClick={() => setTab("applications")}
                  className={classNames(
                    tab === "applications"
                      ? "text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
                      : "hover:text-gray-700 dark:hover:text-gray-200",
                    "flex cursor-pointer select-none items-center gap-x-2 px-2 hover:text-indigo-600 dark:border-gray-700 dark:hover:text-gray-100"
                  )}
                >
                  <UsersIcon className="h-5 w-5" />
                  <h3>Applications ({Object.values(getBountyApplicants(relayUrl, getTagValues("d", bountyEvent.tags))).length})</h3>
                </div>
                {cachedBountyEvent &&
                getTagValues("s", cachedBountyEvent.tags) === "assigned" &&
                ((userPublicKey && bountyEvent.pubkey === userPublicKey) || getTagValues("p", cachedBountyEvent.tags) === userPublicKey) ? (
                  <div
                    onClick={() => setTab("discussion")}
                    className={classNames(
                      tab === "discussion"
                        ? "text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
                        : "hover:text-gray-700 dark:hover:text-gray-200",
                      "flex cursor-pointer select-none items-center gap-x-2 pl-2 hover:text-indigo-600 dark:border-gray-700 dark:hover:text-gray-100"
                    )}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <h3 className="">Discussion</h3>
                  </div>
                ) : (
                  <div className={"flex cursor-not-allowed select-none items-center gap-x-2 pl-2 dark:border-gray-700"}>
                    <LockClosedIcon className="h-5 w-5" />
                    <h3 className="">Discussion</h3>
                  </div>
                )}
              </div>
              {tab === "details" && (
                <>
                  {/* <div className="mt-6 flex items-center justify-between"></div> */}
                  <div className="mt-6 flex flex-row items-start gap-x-4 rounded-3xl border border-gray-600 p-6">
                    <div className="flex items-center gap-2">
                      <Link className="flex items-center gap-x-2" href={`/u/${nip19.npubEncode(bountyEvent.pubkey)}`}>
                        <Avatar
                          src={parseProfileContent(getProfileEvent(relayUrl, bountyEvent.pubkey)?.content)?.picture}
                          seed={bountyEvent.pubkey}
                          className="h-8 w-8 ring-1 ring-white dark:ring-gray-700"
                        />
                      </Link>
                    </div>
                    <div className="flex flex-col gap-y-4">
                      <div className="flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-500">
                        <Link className="" href={`/u/${nip19.npubEncode(bountyEvent.pubkey)}`}>
                          {" "}
                          <div className=" truncate font-medium leading-6 text-gray-800 dark:text-white">
                            {parseProfileContent(getProfileEvent(relayUrl, bountyEvent.pubkey)?.content)?.name ||
                              shortenHash(nip19.npubEncode(bountyEvent.pubkey))}
                          </div>
                        </Link>
                        <div className="text-sm">
                          <span>on </span>
                          {new Date(bountyEvent.created_at * 1000).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: markdown }} />
                    </div>
                  </div>

                  {
                    // TODO: Remove this div when NoComment is replaced with something else
                    // https://github.com/Resolvr-io/resolvr.io/issues/66
                  }
                  <div className="mt-20" ref={NoCommentContainer}>
                    <style>
                      {`
                  :root {
                    --nc-primary-color: ${colors.indigo[500]}
                    
                    
                  }
                  :root.${Theme.dark} {
                    --nc-background: ${colors.gray[800]};
                    --nc-container-font-family: arial;
                    --nc-container-font-size: 1.2em;
                    --nc-comment-author-font-size: 1.2em;
                    --nc-comment-author-font-family: monospace;
                    --nc-comment-author-font-color: ${colors.white};
                    --nc-comment-date-color: inherit;
                    --nc-comment-date-font-family: sans-serif;
                    --nc-comment-date-font-size: 0.7em;
                    --nc-link-text-decor: none;
                    --nc-link-text-decor-hover: underline;
                    --nc-textarea-font-family: inherit;
                    --nc-textarea-font-size: inherit;
                    --nc-text-background: ${colors.gray[800]};
                    --nc-text-color: white;
                    --nc-text-color-dark: white;
                    --nc-primary-color: ${colors.indigo[600]};
                    --nc-primary-contrast: white;
                  }
              `}
                    </style>
                  </div>
                </>
              )}
              {tab === "applications" && (
                <div className="mt-6 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Applicants</h3>
                  <div className="mt-6 flex flex-col gap-y-4">
                    {Object.values(getBountyApplicants(relayUrl, getTagValues("d", bountyEvent.tags))).map((applicantEvent) => (
                      <Applicant key={applicantEvent.pubkey} applicantEvent={applicantEvent} />
                    ))}
                  </div>
                </div>
              )}
              {tab === "discussion" && (
                <div className="mt-6 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Discussion</h3>
                  <div className="mt-4">
                    {cachedBountyEvent &&
                      getTagValues("s", cachedBountyEvent.tags) === "assigned" &&
                      ((userPublicKey && bountyEvent.pubkey === userPublicKey) ||
                        getTagValues("p", cachedBountyEvent.tags) === userPublicKey) && <Discussion />}
                  </div>
                </div>
              )}
            </div>

            <div className="order-first flex w-full flex-col dark:text-gray-400 md:order-2 md:max-w-xs">
              <div className="flex items-center gap-4 border-b border-gray-700 px-2 py-6 sm:items-start md:flex-col">
                <span>Value</span>
                <div className="flex flex-row items-center justify-start">
                  <div className="text-bitcoin">
                    <BitcoinIcon width="2rem" height="2rem" />
                  </div>
                  <span className="font-lexend text-lg font-semibold text-bitcoin">
                    {parseInt(getTagValues("reward", bountyEvent.tags)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 border-b border-gray-700 px-2 py-6 sm:items-start md:flex-col">
                <span>Status</span>
                <div>
                  {" "}
                  <span className="inline-flex items-center gap-x-3 rounded-3xl bg-white px-3 py-2 text-sm font-medium text-gray-600 ring-2 ring-inset ring-gray-300 dark:bg-gray-900 dark:text-white dark:ring-bitcoin">
                    {getTagValues("s", bountyEvent.tags) === "open" && (
                      <>
                        <svg className="h-2 w-2 fill-yellow-400" viewBox="0 0 6 6" aria-hidden="true">
                          <circle cx={3} cy={3} r={3} />
                        </svg>

                        <span className="text-gray-700 dark:text-gray-300">Open</span>
                      </>
                    )}
                    {cachedBountyEvent &&
                      getTagValues("s", bountyEvent.tags) === "assigned" &&
                      !getZapReceiptEvent(relayUrl, cachedBountyEvent.id) && (
                        <>
                          <svg className="h-2 w-2 fill-blue-400" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx={3} cy={3} r={3} />
                          </svg>

                          <span className="text-gray-700 dark:text-gray-300">Assigned</span>
                        </>
                      )}
                    {getTagValues("s", bountyEvent.tags) === "withdrawn" && (
                      <>
                        <svg className="h-2 w-2 fill-red-400" viewBox="0 0 6 6" aria-hidden="true">
                          <circle cx={3} cy={3} r={3} />
                        </svg>

                        <span className="text-gray-700 dark:text-gray-300">Withdrawn</span>
                      </>
                    )}

                    {cachedBountyEvent &&
                      (getTagValues("s", bountyEvent.tags) === "assigned" || getTagValues("s", bountyEvent.tags) === "complete") &&
                      getZapReceiptEvent(relayUrl, cachedBountyEvent.id) && (
                        <>
                          <svg className="h-2 w-2 fill-green-400" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx={3} cy={3} r={3} />
                          </svg>

                          <span className="text-gray-700 dark:text-gray-300">Bounty Paid</span>
                        </>
                      )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 px-2 py-6 sm:items-start md:flex-col">
                <span>Tags</span>
                <div className="flex gap-x-4 md:justify-end">
                  {getBountyTags(bountyEvent.tags).map((tag) => (
                    <div
                      key={tag}
                      className="flex cursor-pointer select-none items-center gap-x-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
