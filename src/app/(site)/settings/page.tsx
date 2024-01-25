"use client";

import SettingsForm from "~/components/settings/SettingsForm";
import useAuth from "~/hooks/useAuth";

export default function SettingsPage() {
  const { pubkey, seckey } = useAuth();

  return <>{pubkey && <SettingsForm pubkey={pubkey} secretKey={seckey} />}</>;
}
