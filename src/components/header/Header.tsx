/* eslint-disable @next/next/no-img-element */

import { authOptions } from "~/app/api/auth/[...nextauth]/auth";
import { type UserWithKeys } from "~/types";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";

export default async function Header() {
  const session = await getServerSession(authOptions);
  let loggedIn = false;
  let publicKey = "";

  if (session?.user) {
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
    }
  }

  return (
    <header className="mb-2 flex items-center justify-between py-4">
      <nav className="flex items-center">
        <Link className="hidden dark:block" href="/">
          <img className="w-[7.5rem]" src="/fundsolvr-logo-dark.svg" alt="" />
        </Link>
        <Link className="dark:hidden" href="/">
          <img className="w-[7.5rem]" src="/fundsolvr-logo-light.svg" alt="" />
        </Link>
      </nav>
      <div className="flex items-center justify-center gap-x-4">
        {loggedIn && (
          <Button
            asChild
            variant="outline"
            className="border-primary hover:bg-primary/90"
            size="sm"
          >
            <Link href="/create">
              <Plus className="mr-1 h-4 w-4" />
              Bounty
            </Link>
          </Button>
        )}
        <ThemeToggle />
        {loggedIn ? (
          <UserProfile pubkey={publicKey} />
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}
