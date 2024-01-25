"use server"

import { type Filter, SimplePool } from "nostr-tools"
import { type RelayUrl } from "react-nostr";

const pool = new SimplePool()

export async function querySync(relays: RelayUrl[], filter: Filter) {
   return await pool.querySync(relays, filter);
}

export async function get(relays: RelayUrl[], filter: Filter) {
   return await pool.get(relays, filter);
}
