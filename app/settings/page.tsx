"use client";

import { useEffect, useState } from "react";

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
    <main className="container mx-auto max-w-5xl">
      {/* Settings forms */}
      <div className="divide-y divide-white/5 flex flex-col">
        <div className="flex flex-col justify-center gap-x-8 gap-y-10 px-4 py-16 sm:flex-row sm:px-6 lg:gap-x-32">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Personal Information</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">Use a permanent address where you can receive mail.</p>
          </div>

          <form className="w-full max-w-xl">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                <img
                  src="https://cdnb.artstation.com/p/assets/images/images/043/120/123/large/wizix-nakamoto-master-full.jpg?1636383169"
                  alt=""
                  className="h-24 w-24 flex-none rounded-full bg-gray-800 object-cover"
                />
                <div>
                  <input
                    type="text"
                    name="picture"
                    id="picture"
                    placeholder="link to profile picture"
                    className="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 placeholder-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">JPG, GIF or PNG.</p>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md bg-white ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 dark:bg-white/5 dark:ring-white/10">
                    <input
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-800 placeholder-gray-400 focus:ring-0 dark:text-white sm:text-sm sm:leading-6"
                      placeholder="satoshi"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                  About
                </label>
                <div className="mt-2">
                  <input
                    id="about"
                    name="about"
                    type="text"
                    autoComplete="about"
                    className="block w-full rounded-md border-0 bg-white py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:bg-white/5 dark:text-white dark:ring-white/10 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex">
              <button
                type="submit"
                className="rounded-md bg-indigo-500  px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-y-10 px-4 py-16 sm:flex-row sm:px-6 lg:gap-x-32">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Connect your Github</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Please enter a public gist id containing your nostr public key.</p>
          </div>

          <div>
            {github ? (
              <div className="mt-6 flex gap-2 text-green-500 dark:text-green-300">
                <svg className="fill-green-500 dark:fill-green-300" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                </svg>
                <span className="font-bold">Github:</span>
                {github}
              </div>
            ) : (
              <form className="md:col-span-2">
                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                  <div className="col-span-full">
                    <label htmlFor="gist-id" className="block text-sm font-medium leading-6 text-white">
                      Gist ID
                    </label>
                    <div className="mt-2">
                      <input
                        onChange={handleGistIdChange}
                        id="gist-id"
                        name="gist-id"
                        type="text"
                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex">
                  <button
                    onClick={connectGithub}
                    type="submit"
                    className="rounded-md bg-indigo-500/80 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    Link Github
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-32">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">Remove account</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              You may remove your account, but keep in mind relays may still retain your data.
            </p>
          </div>

          <form className="flex items-start md:col-span-2">
            <button type="submit" className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400">
              Yes, remove my account
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
