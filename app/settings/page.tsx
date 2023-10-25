"use client";

import { useEffect, useState } from "react";

import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { type Event, Filter, getEventHash } from "nostr-tools";
import { Octokit } from "octokit";

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
  const [about, setAbout] = useState("");
  const [currentUserEvent, setCurrentUserEvent] = useState<Event>({
    kind: 0,
    tags: [],
    content: "",
    created_at: 0,
    pubkey: "",
    id: "",
    sig: "",
  });

  const handleGistIdChange = (event: any) => {
    setGistId(event.target.value);
  };

  const userFilter: Filter = {
    kinds: [0],
    authors: [getUserPublicKey()],
  };

  interface Metadata {
    name: string;
    picture: string;
    about: string;
  }

  const onSeen = () => { };

  const addGithubProfile = async (username: String) => {
    const userProfileEvent = getUserEvent();
    console.log("event", userProfileEvent);

    if (userProfileEvent) {
      const content = JSON.parse(userProfileEvent.content);
      content.github = username;
      content.publicKeyGistId = gistId;
      const stringifiedContent = JSON.stringify(content);
      console.log("content", stringifiedContent);

      let event: Event = {
        id: "",
        sig: "",
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: userProfileEvent?.tags || [],
        content: stringifiedContent,
        pubkey: getUserPublicKey(),
      };

      event.id = getEventHash(event);
      event = await window.nostr.signEvent(event);

      publish([relayUrl], event, onSeen);
    }
  };

  async function connectGithub(e: any) {
    e.preventDefault();
    const octokit = new Octokit({});

    const gist = await octokit.request("GET /gists/{gist_id}", {
      gist_id: gistId,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const files = gist.data.files;
    if (files) {
      const values = Object.values(files);

      if (values) {
        const publicKey = values[0]?.content;
        console.log("publicKey", publicKey);

        if (publicKey) {
          if (publicKey === getUserPublicKey()) {
            console.log("public keys match");
            console.log("write the profile update event to add github");

            if (gist.data.owner) {
              const login = gist.data.owner.login;
              addGithubProfile(login);
            }
          }
        }
      }
    }
  }

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
    const { name, picture, about } = metadata;
    if (picture) {
      setImageUrl(picture);
    }
    if (about) {
      setAbout(about);
    }
    if (name) {
      setUsername(name);
    }
  };

  const saveMetadata = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentContent = JSON.parse(currentUserEvent.content);
    const updatedUserProfile = JSON.stringify({ ...currentContent, name: username, picture: imageURL, about });
    let event: Event = {
      id: "",
      sig: "",
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: currentUserEvent?.tags || [],
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
      github: currentContent.github || "",
      publicKeyGistId: currentContent.publicKeyGistId || "",
    };

    event = await window.nostr.signEvent(event);
    publish([relayUrl], event, onSeen);
    setUserProfile(relayUrl, profile);
    setUserEvent(event);
  };

  useEffect(() => {
    const userProfile = getUserProfile(relayUrl);
    if (userProfile) {
      setGithub(userProfile.github);
      setMetadata({
        name: userProfile.name,
        picture: userProfile.picture,
        about: userProfile.about,
      });
    }
    getUserMetadata();
  }, [relayUrl]);

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
                  <input
                    type="text"
                    name="github"
                    id="github"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                    placeholder="Gist ID"
                  />
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
