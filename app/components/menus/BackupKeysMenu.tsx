"use client";

import { useState } from "react";

import { useUserProfileStore } from "../../stores/userProfileStore";
import BackupKeysButtons from "../BackupKeysButtons";

interface Props {
  onClick?: Function;
}

export default function BackupKeysMenu({ onClick }: Props) {
  const { userPrivateKey } = useUserProfileStore();
  const [checked, setChecked] = useState(false);

  return (
    <div className="container mx-auto w-full max-w-4xl px-4 lg:px-0">
      {userPrivateKey ? (
        <div>
          <h2 className="text-2xl dark:text-white">Backup Your Keys</h2>
          <div className="mt-4">
            <BackupKeysButtons></BackupKeysButtons>
          </div>
          <div className="mt-6 dark:text-white">
            <div
              onClick={(e) => {
                setChecked(!checked);
              }}
              className="mr-auto flex w-fit cursor-pointer select-none flex-row items-center gap-x-2 py-2 pr-2"
            >
              <input
                onClick={(e) => {
                  setChecked(!checked);
                }}
                name="storedkeys"
                id="storedkeys"
                type="checkbox"
                checked={checked}
              />
              <label
                onClick={(e) => {
                  e.preventDefault();
                  setChecked(!checked);
                }}
                htmlFor="storedkeys"
                className="cursor-pointer"
              >
                I have stored my keys
              </label>
            </div>
            <button
              disabled={!checked}
              className="mt-4 w-32 rounded-3xl bg-indigo-500 px-2 py-4 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:dark:bg-indigo-300"
              onClick={(e) => {
                e.preventDefault();
                if (onClick) {
                  onClick();
                }
              }}
            >
              Got it
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="dark:text-white">You must Login or create an account!</div>
        </div>
      )}
    </div>
  );
}
