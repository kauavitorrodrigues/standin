import { EraserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    // Without a way to clear, there is nothing to offer.
    show: boolean;
    label: string;
    disabled: boolean;
    onClear: () => void;
};

// The icon that clears what was marked on the image.
export const ClearMarksButton = ({ show, label, disabled, onClear }: Props) => {
    if (!show) return null;

    return (
        <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClear}
        >
            <EraserIcon />
        </Button>
    );
};
