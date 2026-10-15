import { SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscardChangesButton } from "../../layout/DiscardChangesButton";

type Props = {
    dirty: boolean;
    // What is typed can be saved (the grid, if it changed, fits the image).
    canSave: boolean;
    isSaving: boolean;
    onDiscard: () => void;
    onSave: () => void;
};

// The actions on the bottom bar of the editor of a tileset. Discard sits
// beside save, since they answer the same changes.
export const TilesetEditorControls = ({
    dirty,
    canSave,
    isSaving,
    onDiscard,
    onSave,
}: Props) => (
    <>
        <DiscardChangesButton
            dirty={dirty}
            disabled={isSaving}
            onDiscard={onDiscard}
        />
        <Button disabled={!dirty || !canSave || isSaving} onClick={onSave}>
            <SaveIcon />
            Salvar
        </Button>
    </>
);
