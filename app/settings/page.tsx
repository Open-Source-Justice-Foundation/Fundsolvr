"use client";

import { useEffect, useState } from "react";

import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { type Event, getEventHash } from "nostr-tools";
import { Octokit } from "octokit";

import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";

export default function Settings() {
  const { getUserPublicKey, getUserEvent, getUserProfile } = useUserProfileStore();
  const { publish, relayUrl } = useRelayStore();

  const [gistId, setGistId] = useState("");
  const [github, setGithub] = useState("");

  const handleGistIdChange = (event: any) => {
    setGistId(event.target.value);
  };

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

      publish([relayUrl], event);
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

  useEffect(() => {
    const userProfile = getUserProfile(relayUrl);
    if (userProfile) {
      setGithub(userProfile.github);
    }
  }, []);

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
                  <UserCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                  <div className="flex w-full max-w-sm rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 dark:ring-gray-600">
                    <input
                      type="text"
                      name="picture"
                      id="picture"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="image URL"
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
                      className="block w-full rounded-md border-0 dark:bg-gray-700 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:text-gray-100 dark:ring-gray-600 sm:text-sm sm:leading-6"
                      placeholder="satoshi"
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
                    defaultValue={""}
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
            type="submit"
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
