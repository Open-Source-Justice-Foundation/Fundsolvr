"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Transition } from "@headlessui/react";
import { Event, Filter, generatePrivateKey, getEventHash, getPublicKey, getSignature, nip19 } from "nostr-tools";

import { useRelayStore } from "../stores/relayStore";
import { useUserProfileStore } from "../stores/userProfileStore";
import type { Profile } from "../types";

export default function LoginPage() {
  const { setUserProfile, setUserPublicKey, setUserPrivateKey, getUserPrivateKey, getUserPublicKey } = useUserProfileStore();
  const { relayUrl, publish, subscribe } = useRelayStore();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [userProvidedPrivateKey, setUserProvidedPrivateKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  enum SignupStep {
    Start,
    PrivateKeyLogin,
    CreateAccount,
    SavePrivateKey,
  }
  const [signupStep, setSignupStep] = useState<SignupStep>(SignupStep.Start);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const createKeypair = (): [string, string] => {
    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);
    return [publicKey, privateKey];
  };

  const handleCreateAccount = async (e: any) => {
    e.preventDefault();

    setUserPrivateKey(privKey);
    setUserPublicKey(pubKey);
    const profile: Profile = {
      relay: relayUrl || "",
      publicKey: pubKey,
      name: name || nip19.npubEncode(pubKey),
      about: "",
      picture: "",
      nip05: "",
      website: "",
      lud06: "",
      lud16: "",
      banner: "",
    };

    let event: Event = {
      id: "",
      sig: "",
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify({
        name,
      }),
      pubkey: pubKey,
    };
    event.id = getEventHash(event);
    event.sig = getSignature(event, privKey);
    setUserProfile(relayUrl, profile);

    const onSeen = () => {
      router.push("/");
    };

    publish([relayUrl], event, onSeen);
  };

  const handleCancel = (e: any) => {
    e.preventDefault();
    router.push("/");
  };

  const handleOnChange = (e: any) => {
    setName(e.target.value);
  };

  const handleLoginWithNostr = async (e: any) => {
    e.preventDefault();
    if (typeof nostr !== "undefined") {
      const publicKey: string = await nostr.getPublicKey();
      setUserPublicKey(publicKey);
      router.push("/");
    } else {
      setErrorMessage("No extension found");
    }
  };

  const handleLoginWithPrivateKey = (e: any) => {
    e.preventDefault();
    clearState();
    setSignupStep(SignupStep.PrivateKeyLogin);
  };

  const handleDerivePubkeyFromPrivkey = (e: any) => {
    e.preventDefault();
    if (!userProvidedPrivateKey.startsWith("nsec")) {
      setErrorMessage("Please provide your private key that starts with nsec1");
      return;
    }
    const decodedPrivateKey: any = nip19.decode(userProvidedPrivateKey).data;
    const publicKey = getPublicKey(decodedPrivateKey);

    const userFilter: Filter = {
      kinds: [0],
      authors: [publicKey],
    };

    const onEvent = (event: Event) => {
      setUserPublicKey(publicKey);
      setUserPrivateKey(decodedPrivateKey);
    };

    const onEOSE = () => {
      router.push("/");
    };

    subscribe([relayUrl], userFilter, onEvent, onEOSE);
  };

  const handleBack = (e: any) => {
    e.preventDefault();
    setSignupStep(SignupStep.Start);
    clearState();
  };

  const handleGenerateKeys = (e: any) => {
    e.preventDefault();
    const [publicKey, privateKey] = createKeypair();
    setPubKey(publicKey);
    setPrivKey(privateKey);

    setSignupStep(SignupStep.SavePrivateKey);
  };

  function clearState() {
    setErrorMessage("");
    setName("");
    setPrivKey("");
    setPubKey("");
    setUserProvidedPrivateKey("");
  }

  const copyTextToClipboard = async (text: string) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }
  };

  return (
    mounted && (
      <>
        <div className="flex h-screen items-center justify-center p-4">
          {signupStep === SignupStep.Start && (
            <div className="container m-auto flex w-full max-w-sm flex-col gap-10">
              <h1 className="text-5xl dark:text-white">Get Started</h1>
              <div className="flex flex-col items-start justify-center gap-4">
                <h3 className="font-bold dark:text-white">I have a nostr account</h3>
                <p className="opacity-90 dark:text-white">
                  For premium security, we recommend you login with your Alby or Nos02x extension
                </p>
                <div className="flex w-full flex-col gap-2">
                  <button
                    className="w-full rounded-3xl bg-indigo-500 px-2 py-4 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    onClick={handleLoginWithNostr}
                  >
                    Login with nostr extension
                  </button>
                  {errorMessage && <span className="text-sm text-yellow-600 dark:text-yellow-500">{errorMessage}</span>}
                </div>
                <button
                  className="w-full rounded-3xl bg-gray-600 px-2 py-4 text-sm font-medium text-white hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500"
                  onClick={handleLoginWithPrivateKey}
                >
                  Login with Private key
                </button>
              </div>
              <div className="flex flex-col items-start justify-center gap-4">
                <h3 className="font-bold dark:text-white">I don&apos;t have a nostr account</h3>
                <p className="opacity-90 dark:text-white">Let&apos;s create one in a minute!</p>
                <button
                  className="w-full rounded-3xl bg-gray-600 px-2 py-4 text-sm font-medium text-white hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500"
                  onClick={() => setSignupStep(SignupStep.CreateAccount)}
                >
                  Create Account
                </button>
                <button
                  className="w-full px-2 py-4 text-sm font-medium hover:text-gray-700 dark:text-white dark:hover:opacity-90 "
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {signupStep === SignupStep.PrivateKeyLogin && (
            <div className="container m-auto flex w-full max-w-sm flex-col gap-10">
              <h1 className="text-5xl dark:text-white">Private key login</h1>
              <p className="dark:text-white">Enter your private key to continue (nsec1...)</p>
              <div className="flex w-full flex-col gap-4">
                <input
                  type="password"
                  spellCheck="false"
                  value={userProvidedPrivateKey}
                  // style={{ color: "transparent", textShadow: "0 0 6px rgba(255,255,255,0.9)" }}
                  onChange={(e: any) => {
                    setUserProvidedPrivateKey(e.target.value);
                  }}
                  className="transparent text-shadow w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-100 "
                />
                <div className="flex w-full flex-col gap-2">
                  <button
                    className="rounded-3xl bg-indigo-500 px-2 py-4 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    onClick={handleDerivePubkeyFromPrivkey}
                  >
                    Continue
                  </button>
                  {errorMessage && <span className="text-sm text-yellow-600 dark:text-yellow-500">{errorMessage}</span>}
                </div>
                <button
                  className=" px-2 py-4 text-sm font-medium hover:text-gray-700 dark:text-white dark:hover:opacity-90 "
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {signupStep === SignupStep.CreateAccount && (
            <div className="container m-auto flex w-full max-w-sm flex-col gap-10">
              <h1 className="text-5xl dark:text-white">Enter your name</h1>
              <div className="flex w-full flex-col gap-4">
                <div>
                  <p className="dark:text-white">What should we call you? You can always change this later</p>
                </div>
                <input
                  type="text"
                  placeholder="Enter name here"
                  value={name}
                  onChange={handleOnChange}
                  className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:text-white"
                />
                <button
                  className="rounded-3xl bg-indigo-500 px-2 py-4 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                  onClick={handleGenerateKeys}
                >
                  Continue
                </button>
                <button
                  className=" px-2 py-4 text-sm font-medium hover:text-gray-700 dark:text-white dark:hover:opacity-90 "
                  onClick={handleBack}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {signupStep === SignupStep.SavePrivateKey && (
            <div className="m-auto flex w-full max-w-2xl flex-col items-start justify-center gap-10">
              <div className="w-full">
                <h1 className="text-5xl dark:text-white">Your Keys</h1>
              </div>
              <div className="flex w-full flex-col gap-4">
                <h2 className="opacity-90 dark:text-white">
                  Copy and Save your private key - without it, you will lose access to your account!
                </h2>
                <div className="flex  flex-col gap-4">
                  <label htmlFor="publickey" className="font-medium text-gray-900 dark:text-gray-100">
                    Public Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="publickey"
                      id="publickey"
                      spellCheck="false"
                      value={nip19.npubEncode(pubKey)}
                      onChange={(e) => e.preventDefault()}
                      onClick={async () => {
                        await copyTextToClipboard(nip19.npubEncode(pubKey));
                      }}
                      className="w-full cursor-pointer rounded border border-gray-300 p-2 caret-transparent dark:border-gray-600 dark:bg-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:text-white"
                    />

                    <div className="right-0 top-0 flex h-full items-center justify-center lg:absolute ">
                      <button
                        onClick={async () => {
                          await copyTextToClipboard(nip19.npubEncode(pubKey));
                        }}
                        className="h-full px-4 py-2 active:translate-y-1 dark:text-white hover:dark:text-gray-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <label htmlFor="privatekey" className="font-medium text-gray-900 dark:text-gray-100">
                    Private Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="privatekey"
                      id="privatekey"
                      spellCheck="false"
                      value={nip19.nsecEncode(privKey)}
                      onClick={async () => {
                        await copyTextToClipboard(nip19.nsecEncode(privKey));
                      }}
                      onChange={(e) => e.preventDefault()}
                      className="w-full cursor-pointer rounded border border-gray-300 p-2 caret-transparent dark:border-gray-600 dark:bg-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:text-white"
                    />
                    <div className="right-0 top-0 flex h-full items-center justify-center lg:absolute">
                      <button
                        onClick={async () => {
                          await copyTextToClipboard(nip19.nsecEncode(privKey));
                        }}
                        className="h-full px-4 py-2 active:translate-y-1 dark:text-white hover:dark:text-gray-300"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col items-center justify-center gap-4">
                  <button
                    className="w-full max-w-sm rounded-3xl bg-indigo-500 px-2 py-4 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    onClick={handleCreateAccount}
                  >
                    Continue
                  </button>
                  <button
                    className="w-full max-w-sm px-2 py-4 text-sm font-medium hover:text-gray-700 dark:text-white dark:hover:opacity-90 "
                    onClick={() => {
                      setSignupStep(SignupStep.CreateAccount);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )
  );
}
