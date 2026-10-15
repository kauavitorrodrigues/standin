import type { LibraryTilesetDetail } from "@standin/contracts";
import type { TilesetEditorDialog } from "../../types/editor";
import { RenameTilesetDialog } from "./RenameDialog";
import { DeleteTilesetDialog } from "./DeleteDialog";

type Props = {
    tileset: LibraryTilesetDetail;
    dialog: TilesetEditorDialog;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
};

// The dialog that is open over the editor of a tileset, if any.
export const TilesetEditorDialogs = ({
    tileset,
    dialog,
    onOpenChange,
    onDeleted,
}: Props) => {
    switch (dialog) {
        case "rename":
            return (
                <RenameTilesetDialog
                    tileset={tileset}
                    open
                    onOpenChange={onOpenChange}
                />
            );
        case "delete":
            return (
                <DeleteTilesetDialog
                    tileset={tileset}
                    open
                    onOpenChange={onOpenChange}
                    onDeleted={onDeleted}
                />
            );
        default:
            return null;
    }
};
