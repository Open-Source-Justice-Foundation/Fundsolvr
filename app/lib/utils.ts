import * as crypto from "crypto";
import { Octokit } from "octokit";

export const shortenHash = (hash: string, length = 4 as number) => {
  if (hash) {
    return hash.substring(0, length) + "..." + hash.substring(hash.length - length);
  }
};

export const getTagValues = (name: string, tags: string[][]) => {
  const [itemTag] = tags.filter((tag: string[]) => tag[0] === name);
  const [, item] = itemTag || [, undefined];
  return item;
};

export function getITagValues(entries: any): string[][] {
  return entries
    .filter((entry: any) => entry[0] === "i")
    .map((entry: any) => {
      const [type, name] = entry[1].split(":");
      return [type, name, entry[2]];
    });
}

export const uniqBy = <T>(arr: T[], key: keyof T): T[] => {
  return Object.values(
    // @ts-ignore
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {}
    )
  );
};

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

export function createUniqueUrl(title: string): string {
  const titleSlug = createUrlSlug(title);
  const uniqueHash = generateUniqueHash(title, 12);
  return `${titleSlug}-${uniqueHash}`;
}

export function removeMarkdownTitles(text: string) {
  // Remove Markdown titles
  const titleRegex = /^#+\s.*$/gm;
  text = text.replace(titleRegex, "");

  // Remove Markdown images
  const imageRegex = /!\[.*?\]\(.*?\)/g;
  text = text.replace(imageRegex, "");

  return text;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export async function verifyGithub(npub: string, gistId: string) {
  const octokit = new Octokit({});
  const gist = await octokit.request("GET /gists/{gist_id}", {
    gist_id: gistId,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const files = gist.data.files;
  if (!files) {
    return false;
  }
  const values = Object.values(files);

  if (!values) {
    return false;
  }
  const identityPhrase = values[0]?.content;

  if (!identityPhrase) {
    return false;
  }
  let identityPhraseArr = identityPhrase.split(":");
  const npubFromGist = identityPhraseArr[1].replace(/\r?\n|\r| /g, "");
  if (npubFromGist === npub) {
    return true;
  }
  return false;
}
