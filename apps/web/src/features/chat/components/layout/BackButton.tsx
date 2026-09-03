import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { onClick?: () => void };

// A view without a previous screen to go back to renders nothing, instead
// of the caller deciding that inline with `{onClick && ...}`.
export const BackButton = ({ onClick }: Props) => {
    if (!onClick) return null;

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar"
            onClick={onClick}
        >
            <ArrowLeftIcon />
        </Button>
    );
};
