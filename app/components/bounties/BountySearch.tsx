import { useBountyEventStore } from "@/app/stores/eventStore";


export default function BountySearch() {

  const { setSearch } = useBountyEventStore();

  return (
  <input
    type="text"
    placeholder="Search bounties..."
    onChange={(e) => setSearch(e.target.value)}
    className="w-56 rounded-lg border-0 bg-white pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:text-sm sm:leading-6"
  />
  )
}
