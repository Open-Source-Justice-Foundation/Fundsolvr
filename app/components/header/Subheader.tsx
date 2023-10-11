import Link from "next/link";

export default function Subheader() {
  return (
    <div className="md:flex w-full hidden border-y border-b-gray-500 border-t-gray-700 text-white">
      <div className="container mx-auto flex justify-between">
        <div className="flex flex-row items-center gap-x-6 text-sm font-semibold leading-6 text-gray-400">
          <Link href="/messages">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Messages</span>
          </Link>
          <Link href="/u/asdf">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Profile</span>
          </Link>
          <Link href="/settings">
            <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400 hover:text-gray-100">Settings</span>
          </Link>
        </div>
        <div className="flex items-center gap-x-2 border-x border-gray-700 hover:bg-gray-800 cursor-pointer px-4 py-3">
          <img
            src="https://avatars.githubusercontent.com/u/104653694?s=280&v=4"
            alt=""
            className="h-6 w-6 flex-none rounded-full bg-gray-800 object-cover"
          />
          <span className="cursor-pointer text-sm font-semibold leading-6 text-gray-400">Damus.io</span>
        </div>
      </div>
    </div>
  );
}
