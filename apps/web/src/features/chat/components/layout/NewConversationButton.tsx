import { SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Starting a new conversation is not implemented yet, so this stays visible
// but disabled rather than being left out of the header entirely.
export const NewConversationButton = () => (
    <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Nova conversa"
        disabled
    >
        <SquarePenIcon />
    </Button>
);
