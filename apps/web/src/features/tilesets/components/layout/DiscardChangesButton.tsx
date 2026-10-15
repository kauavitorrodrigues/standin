import { Undo2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    // It waits for a change: there is only something to discard once the marks
    // changed.
    dirty: boolean;
    disabled: boolean;
    onDiscard: () => void;
};

export const DiscardChangesButton = ({ dirty, disabled, onDiscard }: Props) => (
    <Button variant="outline" disabled={!dirty || disabled} onClick={onDiscard}>
        <Undo2Icon />
        Descartar
    </Button>
);
