"use server";

import { revalidateTag } from "next/cache";

const revalidateCachedTag = (tag: string) => {
  revalidateTag(tag);
};

const validateGithub = async (npub: string, github: string, gist: string) => {
  try {
    const res = await (
      await fetch(`https://gist.github.com/${github}/${gist}/raw`)
    ).text();
    return (
      res.trim() ===
      `Verifying that I control the following Nostr public key: ${npub}`
    );
  } catch (_) {
    return false;
  }
};

export { revalidateCachedTag, validateGithub };
