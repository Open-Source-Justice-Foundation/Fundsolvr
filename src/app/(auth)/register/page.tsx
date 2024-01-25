"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";
import { useForm } from "react-hook-form";
import * as z from "zod";

const isValidNpub = (npub: string) => {
  try {
    return nip19.decode(npub).type === "npub";
  } catch (e) {
    return false;
  }
};

const isValidNsec = (nsec: string) => {
  try {
    return nip19.decode(nsec).type === "nsec";
  } catch (e) {
    return false;
  }
};

const formSchema = z.object({
  npub: z.string().refine(isValidNpub, {
    message: "Invalid npub.",
  }),
  nsec: z.string().refine(isValidNsec, {
    message: "Invalid nsec.",
  }),
});

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nsec: "",
      npub: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    const secretKey = generateSecretKey();
    const publicKey = getPublicKey(secretKey);
    const nsec = nip19.nsecEncode(secretKey);
    const npub = nip19.npubEncode(publicKey);

    reset({
      nsec,
      npub,
    });
  }, [reset]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { npub, nsec } = values;
    const publicKey = nip19.decode(npub).data as string;
    const secretKey = nip19.decode(nsec).data as Uint8Array;

    await signIn("credentials", {
      publicKey,
      secretKey,
      redirect: true,
      callbackUrl: "/",
    });
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center pt-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-[22rem]">
        <div className="flex w-full flex-col space-y-4">
          <div className="flex w-full flex-col space-y-4 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an Account
            </h1>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-indigo-500 dark:text-indigo-400"
              >
                Sign in
              </Link>
            </p>
          </div>

          <Form {...form}>
            <form
              className="flex flex-col gap-3"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="nsec"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} disabled placeholder="nsec..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="npub"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} disabled placeholder="npub..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="mt-2 flex gap-x-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                <span>Use a</span>
                <span>
                  <a
                    href="https://getalby.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-500 dark:text-indigo-400 hover:underline"
                  >
                    nostr extension
                  </a>
                </span>
                <span>to login in the future</span>
              </p>

              <Button type="submit" disabled={isLoading}>
                Register
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
