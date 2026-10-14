import { Button } from "@/components/ui/button";

type DiscardButtonProps = {
    hasChanges: boolean;
    onDiscard?: () => void;
};

// Throws the draft away. It waits for a change to the draft.
export const DiscardButton = ({
    hasChanges,
    onDiscard,
}: DiscardButtonProps) => (
    <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!hasChanges}
        onClick={onDiscard}
    >
        Descartar
    </Button>
);
