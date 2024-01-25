import { useMemo } from "react";

import { useRelayStore } from "~/store/relay-store";
import { type Event } from "nostr-tools";
import {
  createATag,
  tag,
  useBatchedEvents,
  type ATagParams,
} from "react-nostr";

type Props = {
  bounty: Event;
};

export default function ApplicationCount({ bounty }: Props) {
  const aTagParams: ATagParams = useMemo(
    () => ({
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue: tag("d", bounty) ?? "",
    }),
    [bounty],
  );

  const { subRelays } = useRelayStore();

  const aTag = useMemo(() => createATag(aTagParams), [aTagParams]);

  const eventKey = `apps`;

  const events = useBatchedEvents(30051, aTag, eventKey, subRelays);

  return <span>{!events ? "0" : events?.length ?? 0}</span>;
}
