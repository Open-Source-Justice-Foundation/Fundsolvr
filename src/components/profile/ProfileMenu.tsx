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

import { Button } from "../ui/button";

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
        <Button variant="ghost" size="smIcon">
          <MoreVertical height={16} width={16} />
        </Button>
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
