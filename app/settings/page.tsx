"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CheckCircleIcon, PhotoIcon, UserCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { connect } from "http2";
import throttle from "lodash/throttle";
import { type Event, Filter, getEventHash } from "nostr-tools";
import { Octokit } from "octokit";
import { RotatingLines } from "react-loader-spinner";

import { shortenHash } from "../lib/utils";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import { Profile } from "../types";

export default function Settings() {
  const { getUserPublicKey, getUserEvent, getUserProfile, setUserProfile, setUserEvent } = useUserProfileStore();
  const { userPublicKey } = useUserProfileStore();
  const { publish, subscribe, relayUrl } = useRelayStore();

  const [gistId, setGistId] = useState("");
  const [github, setGithub] = useState("");

  const [imageURL, setImageUrl] = useState("");
  const [username, setUsername] = useState("");
  const [gistIdValid, setGistIdValid] = useState<Boolean>(false);
  const [loadingGistId, setLoadingGistId] = useState<Boolean>(true);
  const [about, setAbout] = useState("");
  const gistRef = useRef<HTMLInputElement>(null);
  const [currentUserEvent, setCurrentUserEvent] = useState<Event>({
    kind: 0,
    tags: [],
    content: "",
    created_at: 0,
    pubkey: "",
    id: "",
    sig: "",
  });

  const userFilter: Filter = {
    kinds: [0],
    authors: [getUserPublicKey()],
  };

  interface Metadata {
    name: string;
    picture: string;
    about: string;
    github?: string;
    publicKeyGistId?: string;
  }

  const handleGistIdChange = () => {
    setGistId(gistRef?.current?.value || "");
  };

  async function connectGithub(gist_id: string) {
    setLoadingGistId(true);

    if (gist_id.length < 1) {
      setGithub("");
      setGistIdValid(false);
      setLoadingGistId(false);
      return;
    }

    const octokit = new Octokit({});

    try {
      const gist = await octokit.request("GET /gists/{gist_id}", {
        gist_id: gist_id,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      const files = gist.data.files;
      if (files) {
        const values = Object.values(files);

        if (values) {
          const publicKey = values[0]?.content?.split(": ")[1].trim();

          if (publicKey) {
            if (publicKey === getUserPublicKey()) {
              console.log("public keys match");
              console.log("write the profile update event to add github");

              if (gist.data.owner) {
                const login = gist.data.owner.login;
                setGithub(login);
                setGistIdValid(true);
                setLoadingGistId(false);
                return;
              }
            }
          }
        }
      }
      setGithub("");
      setGistIdValid(false);
    } catch (e) {
      console.error("Error fetching Gist: ", e);
      setGithub("");
      setGistIdValid(false);
    }
    setLoadingGistId(false);
  }

  const throttledConnectGithub = useCallback(
    throttle(connectGithub, 1000, {
      trailing: true,
      leading: false,
    }),
    []
  );

  const getUserMetadata = async () => {
    let userProfileEvent: Event;
    const onEvent = (event: Event) => {
      userProfileEvent = event;
    };

    const onEOSE = () => {
      const parsedUserProfile: Metadata = JSON.parse(userProfileEvent.content);
      setCurrentUserEvent(userProfileEvent);
      setMetadata(parsedUserProfile);
    };
    subscribe([relayUrl], userFilter, onEvent, onEOSE);
  };

  const setMetadata = (metadata: Metadata) => {
    const { name, picture, about, github, publicKeyGistId } = metadata;
    if (picture) {
      setImageUrl(picture);
    }
    if (about) {
      setAbout(about);
    }
    if (name) {
      setUsername(name);
    }
    if (github) {
      setGithub(github);
    }
    if (publicKeyGistId) {
      setGistId(publicKeyGistId);
      setGistIdValid(true);
    }
  };

  const saveMetadata = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentContent = JSON.parse(currentUserEvent.content);
    const metadata: Metadata = {
      name: username,
      picture: imageURL,
      about,
    };

    const updatedTags = currentUserEvent.tags.filter((tag) => {
      if (Array.isArray(tag) && tag[0] === "i" && tag[1].startsWith("github:")) {
        return false;
      }
      return true;
    });
    if (github && gistId) {
      updatedTags.push(["i", `github:${github}`, gistId]);
    }
    const updatedUserProfile = JSON.stringify({ ...currentContent, ...metadata });

    let event: Event = {
      id: "",
      sig: "",
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: updatedTags,
      content: updatedUserProfile,
      pubkey: getUserPublicKey(),
    };

    const profile: Profile = {
      relay: relayUrl || "",
      publicKey: getUserPublicKey() || "",
      name: username || shortenHash(getUserPublicKey()) || "",
      about: about || "",
      picture: imageURL || "",
      nip05: currentContent.nip05 || "",
      website: currentContent.website || "",
      lud06: currentContent.lud06 || "",
      lud16: currentContent.lud16 || "",
      banner: currentContent.banner || "",
      github: github || "",
      publicKeyGistId: gistId || "",
    };

    event.id = getEventHash(event);
    event = await window.nostr.signEvent(event);
    publish([relayUrl], event);
    setUserProfile(relayUrl, profile);
    setUserEvent(event);
  };

  useEffect(() => {
    const userProfile = getUserProfile(relayUrl);
    if (userProfile) {
      setMetadata({
        name: userProfile.name,
        picture: userProfile.picture,
        about: userProfile.about,
        github: userProfile.github,
        publicKeyGistId: userProfile.publicKeyGistId,
      });
      if (userProfile.publicKeyGistId) {
        setGistIdValid(true);
      }
    }
    getUserMetadata();
  }, [relayUrl]);

  useEffect(() => {
    throttledConnectGithub(gistId);
  }, [gistId]);

  // TODO: redo the whole thing

  return (
    <div className="flex w-full flex-col items-center justify-center pb-24 pt-10">
      <form className="w-full max-w-4xl">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12 dark:border-gray-700">
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              This information will be displayed publicly so be careful what you share.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  {imageURL ? (
                    <img className="inline-block h-12 w-12 rounded-full" src={imageURL} alt="" />
                  ) : (
                    <UserCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                  )}

                  <div className="flex w-full max-w-sm rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 dark:ring-gray-600">
                    <input
                      type="text"
                      name="picture"
                      id="picture"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="image URL"
                      value={imageURL}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 dark:ring-gray-600 sm:max-w-md">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="satoshi"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  About
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    className="block w-full max-w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                    value={about}
                    onChange={(e) => {
                      setAbout(e.target.value);
                    }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">Write a few sentences about yourself.</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12 dark:border-gray-700">
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Integrations</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">Link your external accounts.</p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="github" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Github
                </label>
                <div className="mt-2">
                  <div className="mt-2 flex items-center gap-x-3">
                    <input
                      type="text"
                      name="github"
                      id="github"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="Gist ID"
                      ref={gistRef}
                      value={gistId}
                      onChange={() => {
                        setLoadingGistId(true);
                        handleGistIdChange();
                      }}
                    />
                    <div className="h-12 w-12">
                      {gistId.length > 0 &&
                        (loadingGistId ? (
                          <RotatingLines strokeWidth="1" width="3rem" visible={true} ariaLabel="spinner-loading" />
                        ) : gistIdValid ? (
                          <CheckCircleIcon className="h-12 w-12 fill-green-500" />
                        ) : (
                          <XCircleIcon className="h-12 w-12 fill-red-500" />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
            Cancel
          </button>
          <button
            onClick={saveMetadata}
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
