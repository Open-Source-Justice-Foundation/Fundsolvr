import { useBountyEventStore } from "@/app/stores/eventStore";


export default function BountySearch() {

  const { setSearch } = useBountyEventStore();

  return (
  <input
    type="text"
    placeholder="Search bounties"
    onChange={(e) => setSearch(e.target.value)}
    className="w-56 rounded-lg border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-700 p-2 text-sm"
  />
  )
}
