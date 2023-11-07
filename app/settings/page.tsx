"use client";

import { useEffect, useState } from "react";

import { UserCircleIcon } from "@heroicons/react/24/solid";
import { type Event, Filter, getEventHash, getSignature, nip19 } from "nostr-tools";
import { Octokit } from "octokit";

import { getITagValues, shortenHash, verifyGithub } from "../lib/utils";
import Avatar from "../messages/components/Avatar";
import { usePostRelayStore } from "../stores/postRelayStore";
import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import { Profile } from "../types";

export default function Settings() {
  const { getUserPublicKey, getUserEvent, getUserProfile, setUserProfile, setUserEvent, userPrivateKey } = useUserProfileStore();
  const { userPublicKey, userEvent } = useUserProfileStore();
  const { publish, subscribe, relayUrl } = useRelayStore();

  const [gistId, setGistId] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [githubVerified, setGithubVerified] = useState(false);
  const { getActivePostRelayURLs } = usePostRelayStore();

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

  // on first load check if the user has a github linked
  // on login make sure fields are populated
  // if user has github linked don't show the github field
  // after save clear cache

  async function verifyGithubForUser(tag: any) {
    const githubUserVerified = await verifyGithub(nip19.npubEncode(getUserPublicKey()), tag[2]);
    setGithubVerified(githubUserVerified);
    if (githubUserVerified) {
      setGithubUser(tag[1]);
    } else {
      setGithubUser("");
    }
  }

  async function verifyGithubForUserOnLogin() {
    const userEvent = getUserEvent(relayUrl);
    if (userEvent) {
      const iTags = getITagValues(userEvent.tags);
      if (iTags.length === 0) {
        setGithubVerified(false);
        setGithubUser("");
      }
      iTags.forEach((tag) => {
        if (tag[0] === "github") {
          verifyGithubForUser(tag);
        } else {
          setGithubVerified(false);
          setGithubUser("");
        }
      });
    }
  }

  useEffect(() => {
    verifyGithubForUserOnLogin();
  }, []);

  useEffect(() => {
    verifyGithubForUserOnLogin();
  }, [relayUrl]);

  const userFilter: Filter = {
    kinds: [0],
    authors: [getUserPublicKey()],
  };

  interface Metadata {
    name: string;
    picture: string;
    about: string;
  }

  const onSeen = () => {};

  const addGithubProfile = async (username: String) => {
    const userProfileEvent = getUserEvent(relayUrl);

    if (userProfileEvent) {
      const githubIdentity = [["i", `github:${username}`, gistId]];
      return githubIdentity;
    }
    return null;
  };

  async function connectGithub() {
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
        const identityPhrase = values[0]?.content;

        if (identityPhrase) {
          let identityPhraseArr = identityPhrase.split(":");
          const npubFromGist = identityPhraseArr[1].replace(/\r?\n|\r| /g, "");

          if (npubFromGist === nip19.npubEncode(getUserPublicKey())) {
            if (gist.data.owner) {
              const login = gist.data.owner.login;
              const tags = await addGithubProfile(login);
              return tags;
            }
          }
        }
      }
    }
  }

  const getUserMetadata = async () => {
    if (!getUserEvent(relayUrl)) {
      return;
    }
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
    setImageUrl(picture || "");
    setAbout(about || "");
    setUsername(name || "");
  };

  const saveMetadata = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentContent = currentUserEvent?.content ? JSON.parse(currentUserEvent?.content) : {};
    const updatedUserProfile = currentContent ? JSON.stringify({ ...currentContent, name: username, picture: imageURL, about }) : "";
    let identityTags: string[][] | null | undefined = [];

    // check if gistId is set
    if (gistId) {
      identityTags = await connectGithub();
      // if it is, check if the public key in the gist matches the user public key
      if (identityTags) {
        currentUserEvent.tags = currentUserEvent.tags.concat(identityTags || []);
        // }
      }
      // if it doesn't, show an error
    }

    // if gistId is not set, save the profile update event

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
      name: username || "",
      about: about || "",
      picture: imageURL || "",
      nip05: currentContent?.nip05 || "",
      website: currentContent?.website || "",
      lud06: currentContent?.lud06 || "",
      lud16: currentContent?.lud16 || "",
      banner: currentContent?.banner || "",
    };
    event.id = getEventHash(event);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
    setUserProfile(relayUrl, profile);
    setUserEvent(relayUrl, event);
  };

  function filterOutGithub(entries: any[]): any[] {
    return entries.filter((entry) => !(entry[0] === "i" && entry[1].startsWith("github:")));
  }

  const removeGithub = async () => {
    const currentContent = JSON.parse(currentUserEvent.content);

    let event: Event = {
      id: "",
      sig: "",
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: currentUserEvent?.tags || [],
      content: JSON.stringify(currentContent),
      pubkey: getUserPublicKey(),
    };

    const profile: Profile = {
      relay: relayUrl || "",
      publicKey: getUserPublicKey() || "",
      name: username || "",
      about: about || "",
      picture: imageURL || "",
      nip05: currentContent.nip05 || "",
      website: currentContent.website || "",
      lud06: currentContent.lud06 || "",
      lud16: currentContent.lud16 || "",
      banner: currentContent.banner || "",
    };

    // remove github tag from event
    event.tags = filterOutGithub(event.tags);

    if (userPrivateKey) {
      event.sig = getSignature(event, userPrivateKey);
    } else {
      event = await window.nostr.signEvent(event);
    }

    publish(getActivePostRelayURLs(), event, onSeen);
    setUserProfile(relayUrl, profile);
    setGithubVerified(false);
    setGithubUser("");
    setGistId("");
    setUserEvent(relayUrl, event);
  };

  useEffect(() => {
    const userProfile = getUserProfile(relayUrl);
    if (userProfile) {
      // setGithub(userProfile.github);
      setCurrentUserEvent(getUserEvent(relayUrl)!);
      setMetadata({
        name: userProfile.name,
        picture: userProfile.picture,
        about: userProfile.about,
      });
    } else {
      setCurrentUserEvent({} as Event);
      setMetadata({
        name: "",
        picture: "",
        about: "",
      });
    }
    // getUserMetadata();
    verifyGithubForUserOnLogin();
  }, [relayUrl, userPublicKey, userEvent]);

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 pb-24 pt-10">
      <form className="w-full max-w-4xl">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12 dark:border-gray-700">
            <div className="flex items-center gap-x-2">
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Profile</h2>
              {relayUrl && <span className="text-gray-400 dark:text-gray-600">({relayUrl.replace("wss://", "")})</span>}
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              This information will be displayed publicly so be careful what you share.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  {getUserPublicKey() ? (
                    <Avatar src={imageURL} seed={getUserPublicKey()} className="inline-block h-12 w-12" />
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
                {githubVerified ? (
                  <div className="mt-2 flex gap-x-4">
                    <span onClick={removeGithub} className="cursor-pointer text-red-400">
                      Unlink Github
                    </span>
                    <span className="flex gap-x-2 text-gray-400">
                      <svg className="fill-gray-400" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                      </svg>

                      {githubUser}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="github"
                      id="github"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="Gist ID"
                      value={gistId}
                      onChange={(e) => {
                        setGistId(e.target.value);
                      }}
                    />
                  </div>
                )}
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
