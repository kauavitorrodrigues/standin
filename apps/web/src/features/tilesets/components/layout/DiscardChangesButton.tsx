import { Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    // Only there is something to discard once the marks changed.
    show: boolean;
    disabled: boolean;
    onDiscard: () => void;
};

export const DiscardChangesButton = ({ show, disabled, onDiscard }: Props) => {
    if (!show) return null;

    return (
        <Button variant="outline" disabled={disabled} onClick={onDiscard}>
            <Undo2Icon />
            Descartar
        </Button>
    );
};
