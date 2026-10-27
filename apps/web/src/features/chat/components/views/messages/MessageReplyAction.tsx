import { MessageSquareReplyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onReply: (() => void) | undefined };

// A reply cannot be replied to and a message not saved yet has no id to reply
// to, so the caller passes no handler for those and nothing renders.
export const MessageReplyAction = ({ onReply }: Props) => {
    if (!onReply) return null;

    return (
        <Button
            type="button"
            aria-label="Responder na conversa"
            onClick={onReply}
            variant="ghost"
            className="flex size-6 text-muted-foreground"
        >
            <MessageSquareReplyIcon className="size-3.5" />
        </Button>
    );
};
