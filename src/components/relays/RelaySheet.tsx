"use client";

import useAuth from "~/hooks/useAuth";

import RelayForm from "./RelayForm";

export default function RelaySheet() {
  const { pubkey } = useAuth();

  return pubkey && <RelayForm pubkey={pubkey} />;
}
