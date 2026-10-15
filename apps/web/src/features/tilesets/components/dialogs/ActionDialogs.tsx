import type { LibraryTilesetSummary } from "@standin/contracts";
import type { TilesetAction } from "../../types/actions";
import { RenameTilesetDialog } from "./RenameDialog";
import { DeleteTilesetDialog } from "./DeleteDialog";

type Props = {
    tileset: LibraryTilesetSummary;
    action: TilesetAction;
    onOpenChange: (open: boolean) => void;
};

// The dialog the menu of a card opened, if any.
export const TilesetActionDialogs = ({
    tileset,
    action,
    onOpenChange,
}: Props) => {
    switch (action) {
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
                />
            );
        default:
            return null;
    }
};
