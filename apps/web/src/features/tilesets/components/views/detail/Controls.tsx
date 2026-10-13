import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscardChangesButton } from "../../layout/DiscardChangesButton";
import { TilesetEditorMenu } from "./Menu";

type Props = {
    dirty: boolean;
    // What is typed can be saved (the grid, if it changed, fits the image).
    canSave: boolean;
    isSaving: boolean;
    onRename: () => void;
    onDelete: () => void;
    onDiscard: () => void;
    onSave: () => void;
};

// The actions on the header of the editor of a tileset. Discard sits beside
// save, since they answer the same changes.
export const TilesetEditorControls = ({
    dirty,
    canSave,
    isSaving,
    onRename,
    onDelete,
    onDiscard,
    onSave,
}: Props) => (
    <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" render={<Link to="/admin/tilesets" />}>
            <ArrowLeftIcon />
            Voltar
        </Button>
        <TilesetEditorMenu onRename={onRename} onDelete={onDelete} />
        <DiscardChangesButton
            show={dirty}
            disabled={isSaving}
            onDiscard={onDiscard}
        />
        <Button disabled={!dirty || !canSave || isSaving} onClick={onSave}>
            <SaveIcon />
            Salvar
        </Button>
    </div>
);
