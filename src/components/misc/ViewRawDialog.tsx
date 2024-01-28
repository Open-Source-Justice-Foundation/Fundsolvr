import { type Event } from "nostr-tools";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  event: Event;
};

export const ViewRawDialog = ({ open, setOpen, event }: Props) => {
  const [, copy] = useCopyToClipboard();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[40rem] max-w-xl">
        <DialogHeader>
          <DialogTitle>Raw JSON</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto bg-muted">
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              await copy(JSON.stringify(event, null, 2));

              toast("Event Copied!", {
                description: "The event has been copied to your clipboard.",
              });
            }}
          >
            Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
