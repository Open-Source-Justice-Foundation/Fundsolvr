import * as crypto from "crypto";

import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fromNow(createdAt: number | undefined) {
  if (!createdAt) {
    return undefined;
  }
  dayjs.extend(relativeTime);
  const time = dayjs(createdAt * 1000).fromNow();
  return time;
}

export function capitalizeFirstLetter(str: string | undefined | null) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUniqueHash(data: string, length: number): string {
  const sha256 = crypto.createHash("sha256");
  sha256.update(data);
  return sha256.digest("hex").substring(0, length);
}

function createUrlSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
}

export function createIdentifier(title: string, pubkey: string): string {
  const titleSlug = createUrlSlug(title);
  const uniqueHash = generateUniqueHash(title + pubkey, 12);
  return `${titleSlug}-${uniqueHash}`;
}

export function pluralize(
  count: number | null | undefined,
  noun: string,
  suffix = "s",
) {
  return `${count ?? 0} ${noun}${count !== 1 ? suffix : ""}`;
}
