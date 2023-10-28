import { Event, Filter } from "nostr-tools";

import { useBountyEventStore } from "../stores/eventStore";
import { useProfileStore } from "../stores/profileStore";
import { useRelayStore } from "../stores/relayStore";
import { getTagValues } from "./utils";

const { getApplicantEvent, setApplicantEvent } = useBountyEventStore.getState();
const { setProfileEvent } = useProfileStore.getState();
const { relayUrl, subscribe } = useRelayStore.getState();

export function retrieveProfiles(pubkey: string[]) {
  const onEvent = (event: Event) => {
    setProfileEvent(relayUrl, event.pubkey, event);
  };

  const onEOSE = () => { };

  const userFilter: Filter = {
    kinds: [0],
    authors: pubkey,
  };

  subscribe([relayUrl], userFilter, onEvent, onEOSE);
}

export function getApplicants(dValues: Set<string>) {
  const applicantFilter: Filter = {
    kinds: [7],
    "#d": Array.from(dValues),
    "#k": ["30050"],
    limit: 1000,
  };

  const onApplicantEvent = (event: Event) => {
    const dValue = getTagValues("d", event.tags);

    const cachedApplicationEvent = getApplicantEvent(relayUrl, dValue, event.pubkey);
    if (!cachedApplicationEvent) {
      setApplicantEvent(relayUrl, dValue, event.pubkey, event);
    }
  };

  const onApplicantEOSE = () => { };

  subscribe([relayUrl], applicantFilter, onApplicantEvent, onApplicantEOSE);
}
