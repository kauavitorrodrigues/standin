import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onClick: () => void };

export const CloseSidebarButton = ({ onClick }: Props) => (
    <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Fechar painel lateral"
        onClick={onClick}
    >
        <XIcon />
    </Button>
);
