import { type Event } from "nostr-tools";

import ApplicationCard from "./ApplicantCard";
import ApplicationLoadButton from "./ApplicationLoadButton";

type Props = {
  bounty: Event;
  applicationEvents: Event[];
  eventKey: string;
  loadOlderEvents: (eventKey: string, page: number) => Promise<void>;
  loading: boolean;
  noEvents: boolean;
  status: string;
};

export default function ApplicationFeed({
  bounty,
  applicationEvents,
  eventKey,
  loadOlderEvents,
  loading,
  noEvents,
  status,
}: Props) {
  async function addMorePosts(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    await loadOlderEvents(eventKey, 1);
  }

  return (
    <>
      <ul className="flex w-full flex-col gap-y-4">
        {(applicationEvents ?? []).map((applicationEvent) => (
          <ApplicationCard
            key={applicationEvent.id}
            bountyEvent={bounty}
            applicationEvent={applicationEvent}
          />
        ))}
      </ul>
      {noEvents && (
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg font-medium text-gray-500">
            No applicants found
          </div>
          <div className="text-sm text-gray-500">
            There are no applicants to display at this time.
          </div>
        </div>
      )}
      {applicationEvents && (
        <ApplicationLoadButton
          postsLength={applicationEvents?.length ?? 0}
          loadFn={addMorePosts}
          loading={loading || status === "fetching"}
        />
      )}
    </>
  );
}
