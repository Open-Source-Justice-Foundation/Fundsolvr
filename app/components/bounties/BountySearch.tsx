import { useBountyEventStore } from "@/app/stores/eventStore";

export default function BountySearch() {
  const { setSearch } = useBountyEventStore();

  return (
    <div className="relative flex w-72 ">
      <div className="absolute bottom-0 top-0 my-auto ml-4 mr-auto flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
          <g clipPath="url(#clip0_1025_1742)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5808 2C5.88639 2 2.08081 5.80558 2.08081 10.5C2.08081 15.1944 5.88639 19 10.5808 19C12.5677 19 14.3954 18.3183 15.8427 17.176L19.495 20.8283C19.8855 21.2188 20.5187 21.2188 20.9092 20.8283C21.2997 20.4378 21.2997 19.8046 20.9092 19.4141L17.2569 15.7618C18.3991 14.3145 19.0808 12.4868 19.0808 10.5C19.0808 5.80558 15.2752 2 10.5808 2ZM4.08081 10.5C4.08081 6.91015 6.99096 4 10.5808 4C14.1707 4 17.0808 6.91015 17.0808 10.5C17.0808 14.0899 14.1707 17 10.5808 17C6.99096 17 4.08081 14.0899 4.08081 10.5Z"
              fill="white"
              fillOpacity="0.75"
              className="fill-black dark:fill-white"
            />
          </g>
          <defs>
            <clipPath id="clip0_1025_1742">
              <rect width="24" height="24" fill="white" transform="translate(0.0808105)" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search bounties..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-sm border-0 bg-transparent bg-white pl-12 pr-10 text-gray-900 shadow-sm outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 sm:text-sm sm:leading-6"
      />
    </div>
  );
}
