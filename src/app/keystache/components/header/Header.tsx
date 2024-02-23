import Link from "next/link";

import { Logo } from "../icons";

export default function Header() {
  return (
    <header className="flex w-full items-center justify-between gap-x-2 border-b border-gray-300 p-4 md:justify-center">
      <Logo className="block md:hidden" />
      <span className="hidden md:block">
        Three easy steps to implement Keystache for your applications   →{" "}
      </span>
      <Link className="text-primary" href="/keystache/demo">
        Documentation
      </Link>
    </header>
  );
}
