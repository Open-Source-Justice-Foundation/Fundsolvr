/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { validateGithub } from "~/server";
import { useRelayStore } from "~/store/relay-store";
import Link from "next/link";
import { nip19, type Event, type EventTemplate } from "nostr-tools";
import { useForm } from "react-hook-form";
import {
  finishEvent,
  identityTag,
  profileContent,
  useBatchedProfiles,
  usePublish,
} from "react-nostr";
import { toast } from "sonner";
import * as z from "zod";

const profileFormSchema = z.object({
  picture: z.string(),
  username: z
    .string()
    .min(1, {
      message: "Username must be at least 1 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  website: z.string(),
  bio: z.string().max(160).min(4),
  lud16: z.string(),
  github: z.string(),
  gist: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Props = {
  pubkey: string;
  secretKey: Uint8Array | undefined;
};

export default function SettingsForm({ pubkey, secretKey }: Props) {
  const { pubRelays, subRelays } = useRelayStore();
  const profileEvent = useBatchedProfiles(pubkey, subRelays);

  const { publish, status, invalidateKeys } = usePublish({
    relays: pubRelays,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      website: "",
      bio: "",
      github: "",
      gist: "",
      lud16: "",
    },
    mode: "onChange",
  });

  const { reset } = form;

  useEffect(() => {
    const profile = profileContent(profileEvent);
    const gistId = identityTag("github", profileEvent?.tags ?? [])?.[2];
    if (profile) {
      reset({
        picture: profile.picture,
        username: profile.name,
        website: profile.website,
        bio: profile.about,
        github: profile.github,
        gist: gistId,
        lud16: profile.lud16,
      });
    }
  }, [reset, pubkey, profileEvent]);

  const removeGithub = (tags: string[][]) => {
    return tags.filter(
      (tag) =>
        tag.length > 1 && !(tag[0] === "i" && tag[1]?.startsWith("github")),
    );
  };

  async function onSubmit(data: ProfileFormValues) {
    const { picture, username, website, bio, lud16, github, gist } = data;

    if (!pubkey) return;

    const profile = profileContent(profileEvent);
    let tags = profileEvent?.tags;

    if (!tags) {
      tags = [];
    }

    let shouldPost = true;

    if (gist) {
      // const validGist = await nip39.validateGithub(pubkey, github, gist);
      const npub = nip19.npubEncode(pubkey);
      const validGist = await validateGithub(npub, github, gist);
      if (validGist) {
        tags = removeGithub(tags);
        tags.push(["i", `github:${github}`, `${gist}`]);
      } else {
        shouldPost = false;
        toast("Invalid Gist", {
          description: "The Gist you provided is invalid.",
        });
      }
    }

    profile.picture = picture;
    profile.name = username;
    profile.website = website;
    profile.about = bio;
    profile.lud16 = lud16;
    profile.github = github;

    const content = JSON.stringify(profile);

    const eventTemplate: EventTemplate = {
      kind: 0,
      tags,
      content,
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await finishEvent(eventTemplate, secretKey);

    const onSeen = (_: Event) => {
      void invalidateKeys([pubkey]);
      toast("Profile updated", {
        description: "Your profile has been updated.",
      });
    };

    if (!shouldPost) return;

    console.log("publishing", event);

    await publish(event, onSeen);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="picture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Picture</FormLabel>
              <FormControl>
                <div className="flex items-center gap-x-2">
                  <img
                    src={field.value}
                    alt=""
                    className="aspect-square w-16 rounded-md border border-border dark:border-border"
                  />

                  <Input {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="satoshi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold tracking-tight">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Manage integrations with external services.
          </p>
        </div>
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Link your Github account to your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gist ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Verify your Github account with:{" "}
                <Link
                  className="text-blue-500 hover:underline dark:text-blue-400"
                  href="https://github.com/nostr-protocol/nips/blob/master/39.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NIP-39
                </Link>
                .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lud16"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lightning Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Link your Lightning Address to your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={status !== "idle"} type="submit">
          Update profile
        </Button>
      </form>
    </Form>
  );
}
