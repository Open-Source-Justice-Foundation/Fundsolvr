import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useAuth from "~/hooks/useAuth";
import { useRelayStore } from "~/store/relay-store";
import { MoreVertical } from "lucide-react";
import { type Event } from "nostr-tools";
import { usePublish } from "react-nostr";
import { toast } from "sonner";

type Props = {
  profileEvent: Event | undefined;
};

export default function ApplicantMenu({ profileEvent }: Props) {
  const { pubkey } = useAuth();

  const { pubRelays } = useRelayStore();

  const { publish, status } = usePublish({
    relays: pubRelays,
  });

  async function handleBroadcast() {
    if (!pubkey) return;

    const onSeen = (_: Event) => {
      toast("Profile was broadcast", {
        description: "Profile has been broadcast to all publish relays.",
      });
    };

    await publish(profileEvent, onSeen);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-secondary/70 dark:hover:bg-secondary/60">
          <MoreVertical className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        <DropdownMenuItem
          onClick={handleBroadcast}
          disabled={status !== "idle"}
        >
          Broadcast
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
