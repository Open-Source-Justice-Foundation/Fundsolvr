"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

import { getTagValues, shortenHash } from "@/app/lib/utils";
import { useRelayStore } from "@/app/stores/relayStore";
import { bech32 } from "bech32";
import { Event, EventTemplate, Filter, UnsignedEvent, getEventHash, nip19, nip57 } from "nostr-tools";

import { fetchInvoice, getZapEndpoint, makeZapRequest } from "../../lib/nostr";
import { useUserProfileStore } from "../../stores/userProfileStore";

export default function PollPage() {
  const { subscribe, relayUrl } = useRelayStore();
  const pathname = usePathname();
  const nevent = pathname.split("/poll/")[1];
  const decodedNevent: any = nip19.decode(nevent).data;
  const [pollEvent, setPollEvent] = useState<Event>();
  const { getUserPublicKey } = useUserProfileStore();
  const [authorProfile, setAuthorProfile] = useState<Event>();
  const [pollAuthorProfile, setPollAuthorProfile] = useState<PollAuthorProfile>();
  const [recipientProfile, setRecipientProfile] = useState<Event<0>>();
  const [structuredPollData, setStructuredPollData] = useState<StructuredPollData>();
  const [voteChoice, setVoteChoice] = useState("");
  const [zapPollResults, setZapPollResults] = useState<Event[]>([]);
  const [pollOptionCount, setPollOptionCount] = useState<PollOptionMap>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [pollIsClosed, setPollIsClosed] = useState(false);
  const [optionToPubkeyMap, setOptionToPubkeyMap] = useState<VoterMap>({});

  // 220522c2c32b3bf29006b275e224b285d64bb19f79bda906991bcb3861e18cb4
  // TODO: Don't let author (or anyone) vote more than once - keep track of which pubkeys voted for which option
  // TODO: Cleanup
  // TODO: Consistent naming and better state management
  // TODO: Cache things, new poll store
  // TODO: Add this to the UI somewhere where it makes sense
  // TODO: reread the nip69 and 57 specs to make sure all MUSTs and SHOULDs are covered
  // TODO: Closed status
  // TODO: figure out why state resets on hot reload (on save) (its because you need cache with default state)

  type PollOptionMap = {
    [index: string]: {
      count: number;
      option: string;
    };
  };

  type VoterMap = {
    [index: string]: Set<string>;
  };
  type PollAuthorProfile = {
    name?: string;
    nip05?: string;
    username?: string;
    pubkey: string;
    picture?: string;
  };

  type PollFilter = {
    ids: string[];
    kinds: number[];
  };

  type StructuredPollData = {
    pollOptions: string[][];
    valueMax?: number;
    valueMin?: number;
    consensus?: number;
    closedAt?: number;
    createdAt: number;
    id: string;
    content: string;
    author: string;
    eventIdReference?: string[];
    zapRecipients?: string[];
  };

  function getPollEvent() {
    const pollFilter: PollFilter = {
      ids: [decodedNevent.id],
      kinds: [6969],
    };
    const onEvent = (event: Event) => {
      setPollEvent(event);
      const data = structureEventData(event);
      const pollOptionMap = data.pollOptions.reduce((obj: PollOptionMap, option: string[]) => {
        obj[option[1]] = {
          count: 0,
          option: option[2],
        };
        return obj;
      }, {});
      setPollOptionCount(pollOptionMap);
      setStructuredPollData(data);
    };

    const onEOSE = () => {
      // getPollOutcomeEvents();
      // Cache event!
    };
    subscribe(decodedNevent.relays, pollFilter, onEvent, onEOSE);
  }

  function getPollOutcomeEvents() {
    const pollOutcomeFilter = {
      kinds: [9735],
      "#e": [decodedNevent.id],
    };

    const results: Event[] = [];

    const onEvent = (event: Event) => {
      results.push(event);
      const voter = formatResults(event);
      const vote = voter.tags.find((tag: string) => tag[0] === "poll_option")[1];
      setOptionToPubkeyMap((map) => ({
        ...map,
        [vote]: new Set(map[vote]).add(event.pubkey),
      }));
    };

    const onEOSE = () => {
      setZapPollResults(results);
      // getPollAuthorEvent();
      // Cache event!
    };

    subscribe(decodedNevent.relays, pollOutcomeFilter, onEvent, onEOSE);
  }

  function getPollAuthorEvent() {
    const authorFilter = {
      kinds: [0],
      authors: [decodedNevent.author],
    };

    const onEvent = (event: Event) => {
      const authorProfile = JSON.parse(event.content);
      setAuthorProfile(event);
      setPollAuthorProfile({
        name: authorProfile.name || "",
        nip05: authorProfile.nip05 || "",
        username: authorProfile.username || "",
        pubkey: decodedNevent.author || "",
        picture: authorProfile.picture || "",
      });
    };

    const onEOSE = () => {
      // getRecipientProfileEvent();
      // Cache event!
    };
    subscribe(decodedNevent.relays, authorFilter, onEvent, onEOSE);
  }

  function getRecipientProfileEvent() {

    const authors = structuredPollData?.zapRecipients![0]

    if (!authors) {
      return
    }

    const recipientFilter: Filter = {
      kinds: [0],
      authors: [authors],
    };

    const onEvent = (event: Event<0>) => {
      // const recipient = JSON.parse(event);
      console.log("r", event);
      setRecipientProfile(event);
    };

    const onEOSE = () => {
      // Cache event!
    };
    subscribe(decodedNevent.relays, recipientFilter, onEvent, onEOSE);
  }

  function structureEventData(event: Event) {
    const data: StructuredPollData = {
      pollOptions: event.tags?.filter((tag) => Array.isArray(tag) && tag[0] === "poll_option") || [[]],
      valueMax: formatTagStringAsNumber("value_maximum", event.tags),
      valueMin: formatTagStringAsNumber("value_minimum", event.tags),
      consensus: formatTagStringAsNumber("consensus_threshold", event.tags),
      closedAt: formatTagStringAsNumber("closed_at", event.tags),
      id: event.id || "",
      createdAt: event.created_at || 0,
      content: event.content || "",
      author: event.pubkey || "",
      eventIdReference:
        event.tags
          ?.filter((tag) => Array.isArray(tag) && tag[0] === "e")
          .flat()
          .filter((str) => str !== "e" && !str.startsWith("wss://")) || [],
      zapRecipients:
        event.tags
          ?.filter((tag) => Array.isArray(tag) && tag[0] === "p")
          .flat()
          .filter((str) => str !== "p" && !str.startsWith("wss://")) || [],
    };
    return data;
  }

  function tallyVotes(results: Event[]) {
    let totalVotes = 0;
    let voterMap: VoterMap = { ...optionToPubkeyMap };
    results.forEach((result, i) => {
      const description = formatResults(result);
      if (structuredPollData) {
        /*
         * Zap Vote tally validation.
         * Rules should follow:
         * https://github.com/toadlyBroodle/nips/blob/8268215f7c085cd0a07da760142844a58c905883/69.md#zap-poll-outcome
         */
        const vote = getTagValues("poll_option", description.tags);
        const eventIdsMatch = getTagValues("e", description.tags) === structuredPollData.id;
        const amountsMatch =
          window.parseInt(getTagValues("amount", description.tags)) === structuredPollData.valueMax! * 1000 && // convert to millisats
          window.parseInt(getTagValues("amount", description.tags)) === structuredPollData.valueMin! * 1000;
        const voteCastAfterPollCreated = result.created_at * 1000 > structuredPollData.createdAt! * 1000; // convert to milliseconds
        const voteCastBeforePollClosed = result.created_at * 1000 < structuredPollData.closedAt! * 1000;
        let userAlreadyVoted = false;

        if (voterMap) {
          userAlreadyVoted = voterMap[vote].has(description.pubkey);
        }

        let includesRecipientAddress = false;
        for (let recipient of structuredPollData.zapRecipients!) {
          if (description.tags.find((tag: string[]) => tag[0] === "p").includes(recipient)) {
            includesRecipientAddress = true;
          }
        }

        if (
          eventIdsMatch &&
          amountsMatch &&
          voteCastAfterPollCreated &&
          voteCastBeforePollClosed &&
          includesRecipientAddress &&
          !userAlreadyVoted
        ) {
          totalVotes += 1;
          voterMap = {
            ...voterMap,
            [vote]: new Set(voterMap[vote]).add(description.pubkey),
          };
          setPollOptionCount((counter: PollOptionMap) => ({
            ...counter,
            [vote]: {
              count: counter[vote].count + 1,
              option: counter[vote].option,
            },
          }));
        }
      }
    });
    setOptionToPubkeyMap(voterMap);
    setTotalVotes(totalVotes);
  }

  function formatResults(result: Event) {
    const description = JSON.parse(result.tags.find((tag) => tag[0] === "description")![1]);
    return description;
  }

  async function handleVoteClick(e: any, voteChoice: string) {
    e.preventDefault();
    if (pollIsClosed) {
      alert("cant vote - the poll is closed!");
      return;
    }
    if (optionToPubkeyMap[voteChoice] && optionToPubkeyMap[voteChoice].has(getUserPublicKey())) {
      alert("already voted!");
      return;
    }
    setVoteChoice(voteChoice);

    const tags = buildRequiredTags(voteChoice);

    if (typeof window.webln !== "undefined") {
      try {
        // TODO: check if already enabled
        const enabled = await window.webln.enable();
        // TODO: maybe save this state later
      } catch (e) {
        console.log("Connect Error:", e);
      }

      const zapEndpoint = await getZapEndpoint(recipientProfile!);

      if (!zapEndpoint) {
        alert("No zap endpoint found");
        return;
      }
      const encodedEndpoint = bech32.toWords(Buffer.from(zapEndpoint, "utf8"));
      // Optional, but recommended to add the lnurl to tags
      // the limit is 90...but sometimes that fails? overwriting with 100 limit? Seems bad man!
      tags.push(["lnurl", bech32.encode("lnurl", encodedEndpoint, 100)]);
      console.log(tags);
      const zapArgs = {
        profile: getUserPublicKey(),
        event: decodedNevent.id,
        amount: structuredPollData?.valueMin! * 1000, // it's in millisats
        relays: [...decodedNevent.relays],
        comment: `voted on poll ${decodedNevent.id}`, // TODO: add a helpful comment
        tags,
      };

      const zapEventTemplate: EventTemplate = makeZapRequest(zapArgs);
      const unsignedZapEvent: UnsignedEvent = {
        ...zapEventTemplate,
        pubkey: getUserPublicKey(),
      };
      const zapId = getEventHash(unsignedZapEvent);
      const zapEvent = await window.nostr.signEvent({ ...unsignedZapEvent, id: zapId });
      const invoice = await fetchInvoice(zapEndpoint, zapEvent);
      try {
        const result = await webln.sendPayment(invoice);
        console.log("Zap Result:", result);

        setPollOptionCount((counter) => ({
          ...counter,
          [voteChoice]: {
            count: counter[voteChoice].count + 1,
            option: counter[voteChoice].option,
          },
        }));
        setTotalVotes(totalVotes + 1);
        setOptionToPubkeyMap((map) => ({
          ...map,
          [voteChoice]: new Set(map[voteChoice]).add(getUserPublicKey()),
        }));
      } catch (e) {
        console.log("Zap Error:", e);
      }
    }
  }
  function buildRequiredTags(voteChoice: string) {
    const tags = [];

    tags.push(["poll_option", voteChoice]);
    tags.push(["e", structuredPollData?.id, ...decodedNevent.relays]);
    structuredPollData?.zapRecipients?.forEach((recipient) => {
      tags.push(["p", recipient, ...decodedNevent.relays]);
    });
    tags.push(["amount", (structuredPollData?.valueMin! * 1000).toString()]);
    tags.push(["relays", ...Array.from(new Set([...decodedNevent.relays, relayUrl]))]);

    return tags;
  }

  function formatTagStringAsNumber(name: string, tags: string[][]) {
    return tags
      .filter((tag) => Array.isArray(tag) && tag[0] === name)
      .reduce((num, val) => {
        if (val[1]) {
          num = window.parseInt(val[1]);
          return num;
        }
        return num;
      }, 0);
  }

  useEffect(() => {
    getPollEvent();
    getPollAuthorEvent();
    getPollOutcomeEvents();
  }, []);

  useEffect(() => {
    getRecipientProfileEvent();
    if (Date.now() > structuredPollData?.closedAt! * 1000) {
      setPollIsClosed(true);
    }
  }, [structuredPollData]);

  useEffect(() => {
    tallyVotes(zapPollResults);
  }, [zapPollResults]);

  return (
    <div className="m-auto max-w-4xl dark:text-white">
      {pollEvent && (
        <div className="dark:hover:border-gray-500/60z relative flex flex-col gap-y-4 rounded-lg border border-gray-200 bg-white p-6 py-4 pr-4 shadow-lg shadow-black/10 transition duration-150 ease-in-out hover:border-gray-400/70 dark:border-gray-500/30 dark:bg-gray-800/80">
          {pollAuthorProfile && (
            <div>
              <div className="flex items-center gap-x-2">
                <div>
                  <img
                    src={pollAuthorProfile.picture}
                    alt={`profile picture of ${pollAuthorProfile.name}`}
                    className="inline-block aspect-square h-10 w-10 select-none rounded-full object-cover shadow-lg shadow-gray-800/10 ring-1 ring-gray-900/10 backdrop-blur hover:bg-gray-50 dark:ring-white/10 dark:hover:bg-gray-800/90"
                  ></img>
                </div>
                <div>{pollAuthorProfile.name}</div>
                <span>|</span>
                <div>{shortenHash(nip19.npubEncode(pollAuthorProfile.pubkey))}</div>
                <div className="ml-auto text-sm leading-6">Created on {new Date(pollEvent.created_at * 1000).toLocaleString()}</div>
              </div>
            </div>
          )}

          {structuredPollData && (
            <div>
              <div>{structuredPollData.content}</div>
              <div className="my-4 flex flex-col justify-start gap-y-2">
                {structuredPollData.pollOptions.map((option, i) => {
                  return (
                    <div className="relative flex flex-col" key={i}>
                      <button
                        onClick={(e) => {
                          handleVoteClick(e, option[1]);
                        }}
                        className="flex cursor-pointer rounded-lg border-2 border-gray-500 p-2 text-sm leading-6 hover:border-indigo-500"
                      >
                        {totalVotes > 0 && <span className="mr-2">{`${Math.round((pollOptionCount[i].count / totalVotes) * 100)}%`}</span>}
                        <span>{option[2]}</span>
                      </button>
                      <div
                        style={{ width: `${(totalVotes > 0 ? pollOptionCount[i].count / totalVotes : 0) * 100}%` }}
                        className="pointer-events-none absolute h-full w-full max-w-full rounded-lg bg-indigo-500 opacity-10 transition-all duration-500"
                      ></div>
                    </div>
                  );
                })}
              </div>
              <div className="mb-2 flex flex-row justify-between text-sm leading-6 text-gray-500">
                <div>
                  {totalVotes} votes • {structuredPollData.consensus}% needed to pass
                </div>
                {(() => {
                  if (structuredPollData.valueMin && structuredPollData.valueMax) {
                    if (structuredPollData.valueMin === structuredPollData.valueMax) {
                      return <div>{structuredPollData.valueMin} satoshis</div>;
                    } else {
                      return (
                        <div>
                          <div>Minimum to vote: {structuredPollData.valueMin} satoshis</div>;
                          <div>Maximum to vote: {structuredPollData.valueMin} satoshis</div>;
                        </div>
                      );
                    }
                  }
                })()}
              </div>
              <div className="flex flex-col gap-y-2">
                {/* {structuredPollData.eventIdReference &&
                  structuredPollData.eventIdReference.map((event, i) => {
                    return <div key={i}>For event: {event[1]}</div>;
                  })} */}
                {/* {structuredPollData.zapRecipients &&
                  structuredPollData.zapRecipients.map((recipient, i) => {
                    return <div key={i}>Send Zap to: {recipient[1]}</div>;
                  })} */}

                {/* {structuredPollData.consensus && <div>Minimum threshold to pass vote: {structuredPollData.consensus}%</div>} */}
                {/* <div>Poll ID: {structuredPollData.id}</div> */}

                {/* <div>Poll author: {pollEvent.pubkey}</div> */}
              </div>
              <div>
                {/* <span>Results:</span> */}
                {/* {pollOptionCount &&
                  Object.entries(pollOptionCount).map(([optionIndex, optionData], i) => {
                    return (
                      <div key={i}>
                        Index {optionIndex}: {optionData.option}: {optionData.count} | {Math.round((optionData.count / totalVotes) * 100)}%
                      </div>
                    );
                  })} */}
                <div className="flex flex-row justify-between">
                  {/* <div>Primary Relay: {decodedNevent.relays}</div> */}
                  {structuredPollData.closedAt && (
                    <div className="ml-auto text-sm leading-6">
                      Closes on {new Date(structuredPollData.closedAt * 1000).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
