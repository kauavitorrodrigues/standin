import { DEFAULT_WALL_STYLE } from "../../consts/wall";
import { getWallSelection } from "../../utils/editor/wall/getWallSelection";
import { useTileEditorContext } from "./useEditorContext";

// What the wall panel reads and does: the walls that are selected, the piece
// and the style of the only one, and the edits that go to the selected walls.
// A piece picked on a wall that has no style joins the style of the tiles
// already there, or the default one.
export const useWallPanel = () => {
    const { meta, selected, wall, disabled, url, grid, canEdit } =
        useTileEditorContext();
    const selection = getWallSelection(meta, selected);
    const fallbackStyle = selection.styles[0]?.name ?? DEFAULT_WALL_STYLE;
    const editable = selection.walls.some(canEdit) && !disabled;

    const pickPiece = (piece: NonNullable<typeof selection.piece>) => {
        if (piece === selection.piece) return wall.setPiece(null);
        wall.setPiece(piece, fallbackStyle);
    };

    return {
        ...selection,
        meta,
        url,
        grid,
        editable,
        entry:
            selection.single === null
                ? undefined
                : meta[String(selection.single)],
        wall,
        pickPiece,
    };
};
