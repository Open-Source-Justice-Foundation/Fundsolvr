import Link from "next/link";

import { Arrow, Logo } from "../icons";

export default function Header() {
  return (
    <header className="flex w-full items-center justify-between gap-x-1 border-b border-gray-300 p-4 md:justify-center">
      <Logo className="block md:hidden" />
      <span className="hidden md:block">
        <span className="font-semibold">Three easy steps</span>{" "}
        <span className="text-[#364C63]">
          to implement Keystache for your applications
        </span>
      </span>
      <div className="hidden md:block">
        <Arrow />
      </div>{" "}
      <Link className="text-primary" href="/keystache/demo">
        Documentation
      </Link>
    </header>
  );
}
