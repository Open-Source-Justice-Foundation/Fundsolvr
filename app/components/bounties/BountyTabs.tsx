import { ArrowUpTrayIcon, NewspaperIcon, UserIcon } from "@heroicons/react/24/outline";

import { classNames } from "../../lib/utils";
import { useBountyEventStore } from "../../stores/eventStore";
import { BountyTab } from "../../lib/constants";

export default function BountyTabs() {
  const { bountyType, setBountyType } = useBountyEventStore();

  function switchToAll() {
    setBountyType(BountyTab.all);
  }

  function switchToPosted() {
    setBountyType(BountyTab.userPosted);
  }

  return (
    <div className="flex w-full max-w-4xl justify-start gap-x-2 overflow-auto border-b border-gray-300 px-2 pb-3 text-gray-600 dark:border-gray-600 dark:text-gray-300 md:overflow-hidden">
      <div
        onClick={switchToAll}
        className={classNames(
          bountyType === BountyTab.all
            ? "text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
            : "border-transparent hover:text-gray-700 dark:hover:text-gray-200",
          "flex cursor-pointer select-none items-center gap-x-2 border-r border-slate-400 pr-2 dark:border-gray-700 dark:hover:text-gray-100"
        )}
      >
        <NewspaperIcon className="h-5 w-5" aria-hidden="true" />
        <span className="whitespace-nowrap">Open Bounties</span>
      </div>
      <div
        onClick={switchToPosted}
        className={classNames(
          bountyType === BountyTab.userPosted
            ? "text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
            : "border-transparent hover:text-gray-700 dark:hover:text-gray-200",
          "flex cursor-pointer select-none items-center gap-x-2 border-r border-slate-400 pr-2 dark:border-gray-700 dark:hover:text-gray-100"
        )}
      >
        <ArrowUpTrayIcon className="h-5 w-5" aria-hidden="true" />
        <span className="whitespace-nowrap">Posted Bounties</span>
      </div>
      <div
        className={classNames(
          bountyType === BountyTab.assigned
            ? "border-indigo-300 text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-400"
            : "border-transparent hover:text-gray-700 dark:hover:text-gray-200",
          "flex cursor-pointer select-none items-center gap-x-2 pr-2 hover:text-indigo-600 dark:hover:text-gray-100"
        )}
      >
        <UserIcon className="h-5 w-5" aria-hidden="true" />
        <span className="whitespace-nowrap">Assigned Bounties</span>
      </div>
    </div>
  );
}
