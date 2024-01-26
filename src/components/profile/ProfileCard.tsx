/* eslint-disable @next/next/no-img-element */
"use client";

import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { useRelayStore } from "~/store/relay-store";
import { Github, Globe, Zap } from "lucide-react";
import { profileContent, shortNpub, useBatchedProfiles } from "react-nostr";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import ProfileMenu from "./ProfileMenu";

type Props = {
  pubkey: string;
};

export default function ProfileCard({ pubkey }: Props) {
  const { subRelays } = useRelayStore();
  const profileEvent = useBatchedProfiles(pubkey, subRelays);

  return (
    <div
      // className="sticky top-2 min-w-[20rem]"
      className="py-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-x-4">
            <img
              src={
                profileContent(profileEvent).picture ??
                BOT_AVATAR_ENDPOINT + pubkey
              }
              alt=""
              className="aspect-square w-24 rounded-md border border-border dark:border-border"
            />

            <div className="flex flex-col gap-y-1">
              <span className="text-3xl">
                {profileContent(profileEvent).name}
              </span>
              <span className="flex items-center gap-x-1">
                <span className="text-muted-foreground">
                  {profileContent(profileEvent).nip05 ?? shortNpub(pubkey)}
                </span>
                {profileEvent && <ProfileMenu profileEvent={profileEvent} />}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>{profileContent(profileEvent).about}</CardContent>
        <CardFooter>
          <div className="flex flex-col gap-y-2">
            {profileContent(profileEvent).website && (
              <span className="flex items-center text-sm font-light text-muted-foreground">
                <Globe className="mr-1 h-4 w-4" />
                {profileContent(profileEvent).website}
              </span>
            )}

            {profileContent(profileEvent).lud16 && (
              <span className="flex items-center text-sm font-light text-muted-foreground">
                <Zap className="mr-1 h-4 w-4" />
                {profileContent(profileEvent).lud16}
              </span>
            )}

            {profileContent(profileEvent).github && (
              <span className="flex items-center text-sm font-light text-muted-foreground">
                <Github className="mr-1 h-4 w-4" />
                {profileContent(profileEvent).github}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
