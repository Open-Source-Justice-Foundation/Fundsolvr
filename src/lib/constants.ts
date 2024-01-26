import { type RelayUrl } from "react-nostr";

export const TAGS = [
  "bitcoin",
  "nostr",
  "lightning",
  "programming",
  "hiring",
  "ai",
  "tech",
  "science",
  "politics",
  "sports",
  "entertainment",
  "business",
  "finance",
  "health",
  "weather",
  "philosophy",
  "religion",
  "art",
  "music",
  "culture",
  "history",
  "education",
  "travel",
  "food",
];

export const BOT_AVATAR_ENDPOINT =
  "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=";

export const DEFAULT_SUBSCRIBE_RELAYS: RelayUrl[] = [
  "wss://nos.lol",
  "wss://relay.damus.io",
];
export const DEFAULT_PUBLISH_RELAYS: RelayUrl[] = [
  "wss://nos.lol",
  "wss://relay.damus.io",
];

export const VANITY_PROFILES: Record<string, `npub1${string}`> = {
  alby: "npub1getal6ykt05fsz5nqu4uld09nfj3y3qxmv8crys4aeut53unfvlqr80nfm",
  fiatjaf: "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6",
  chris: "npub1ygzj9skr9val9yqxkf67yf9jshtyhvvl0x76jp5er09nsc0p3j6qr260k2",
};
