import { SquarePenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onClick: () => void };

export const NewConversationButton = ({ onClick }: Props) => (
    <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Nova conversa"
        onClick={onClick}
    >
        <SquarePenIcon />
    </Button>
);
