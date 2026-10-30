import { useClipDialogs } from "../../hooks/useClipDialogs";
import { useClipTile } from "../../hooks/useClipTile";
import type { TileSlotProps } from "../../types/tile";
import { ClipManageMenu } from "../views/tile/ManageMenu";
import { ClipPreviewButton } from "../views/tile/PreviewButton";
import { ClipTileOverlay } from "../views/tile/TileOverlay";
import { ClipDialogs } from "./ClipDialogs";

// Over a tile of the manager, built as the panel's: listen alone at the left
// corner, and at the right corner the actions menu, with edit and delete, for
// the clips the person may change. A clip they may not change (the default
// ones) shows only the listen icon. Nothing is played into a call here.
export const ManageTileOverlay = ({ clip }: TileSlotProps) => {
    const tile = useClipTile(clip);
    const dialogs = useClipDialogs();

    return (
        <ClipTileOverlay>
            <ClipPreviewButton clip={clip} onPreview={tile.preview} />
            <ClipManageMenu
                visible={clip.canManage}
                onEdit={() => dialogs.open("edit")}
                onDelete={() => dialogs.open("delete")}
            />
            <ClipDialogs
                clip={clip}
                kind={dialogs.kind}
                onClose={dialogs.close}
            />
        </ClipTileOverlay>
    );
};
