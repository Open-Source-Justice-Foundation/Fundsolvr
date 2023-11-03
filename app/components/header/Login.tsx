"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useUserProfileStore } from "@/app/stores/userProfileStore";

import UserProfile from "../profile/UserProfile";

export default function Login({ children }: any) {
  const { userPublicKey, setUserPublicKey } = useUserProfileStore();
  // https://github.com/vercel/next.js/discussions/17443
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && <div>{userPublicKey === "" ? <Link href="/login">{children}</Link> : <UserProfile />}</div>;
  // : (
  // <UserCircleIcon className="h-7 w-7 text-smoke-400" aria-hidden="true" />
  // );
}
