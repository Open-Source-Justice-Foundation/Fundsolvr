import * as crypto from "crypto";

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

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// // Example usage:
// const title = "My Exciting Blog Post";
// const uniqueUrl = createUniqueUrl(title);

// console.log(`Original Title: ${title}`);
// console.log(`Generated URL Segment: ${uniqueUrl}`);
