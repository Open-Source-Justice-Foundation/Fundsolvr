import Shimmer from "./Shimmer";

const Bounty = () => (
  <div className="w-full cursor-wait overflow-x-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-lg shadow-black/10 hover:border-gray-400/70 dark:border-gray-500/30 dark:bg-gray-800/80 dark:hover:border-gray-500/60">
    <div className="item-start mb-8 flex gap-8">
      <div className="flex w-full flex-col gap-4">
        <div className="mb-2 flex items-center gap-4">
          <Shimmer className="h-3 w-24 rounded-sm" />
          <Shimmer className="ml-auto h-6 w-16 rounded-md" />
        </div>
        <Shimmer className="mb-2 h-3 w-1/2 rounded-sm" />
        <Shimmer className="h-3 w-3/4 rounded-sm" />
        <Shimmer className="h-3 w-1/3 rounded-sm" />
      </div>
    </div>
    <div className="flex w-full items-center gap-4">
      <Shimmer className="h-8 w-8 rounded-full" />
      <Shimmer className="h-3 w-1/4 rounded-sm" />
      <Shimmer className="ml-auto h-3 w-20 rounded-sm" />
    </div>
  </div>
);

export default Bounty;
