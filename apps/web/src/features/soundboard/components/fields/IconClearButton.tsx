import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { icon: string; disabled: boolean; onClear: () => void };

// Removes the icon, while there is one.
export const IconClearButton = ({ icon, disabled, onClear }: Props) => {
    if (icon === "") return null;

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            aria-label="Remover ícone"
            disabled={disabled}
            onClick={onClear}
        >
            <XIcon /> Remover ícone
        </Button>
    );
};
