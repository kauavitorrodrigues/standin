import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onClick: () => void };

export const RefreshButton = ({ onClick }: Props) => (
    <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Atualizar mensagens"
        onClick={onClick}
    >
        <RefreshCwIcon />
    </Button>
);
