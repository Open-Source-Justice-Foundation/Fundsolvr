import { Separator } from "~/components/ui/separator";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Fundsolvr | Settings",
  description: "Update your profile settings on the network.",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6 py-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your profile settings across the nostr network.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
