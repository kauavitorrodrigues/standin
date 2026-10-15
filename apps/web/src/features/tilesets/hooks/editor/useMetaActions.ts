import { useLayoutEffect, useRef } from "react";
import type { TileMeta } from "@standin/contracts";
import type { CanEditTile, TileCategory } from "../../types/meta";
import type { TileBrush } from "../../types/sheet";
import { useTileHistory } from "./useHistory";
import type { WallPiece } from "@standin/contracts";
import type { WallPaintAction } from "../../consts/wall";
import {
    clearWallCollision,
    paintWallCollision,
    type WallCell,
} from "../../utils/editor/wall/paintWallCollision";
import { setWallOverlap } from "../../utils/editor/wall/setWallOverlap";
import { setWallPiece } from "../../utils/editor/wall/setWallPiece";
import { setWallStyle } from "../../utils/editor/wall/setWallStyle";
import {
    clearTileCategory,
    setTileBlankDefault,
    setTileCategory,
    setTileSolid,
    setTileTop,
} from "../../utils/editor/metaEdit";

type Params = {
    meta: TileMeta;
    onChange: (meta: TileMeta) => void;
    canEdit: CanEditTile;
    selected: number[];
};

// What the editor does to the marks of the sheet: give the selected tiles a
// category, make them solid, move the default of the blank map, set the top
// of a wall, edit the wall piece fields, paint tiles with the brush, erase them, or undo and redo what was done.
export const useTileMetaActions = ({
    meta,
    onChange,
    canEdit,
    selected,
}: Params) => {
    // The latest meta, so a stroke that paints many tiles in a row builds on
    // what the previous tile already changed.
    const latest = useRef(meta);
    useLayoutEffect(() => {
        latest.current = meta;
    });

    const restore = (next: TileMeta) => {
        latest.current = next;
        onChange(next);
    };

    const history = useTileHistory({ latest, onRestore: restore });

    const commit = (next: TileMeta) => {
        if (next === latest.current) return;
        history.record();
        restore(next);
    };

    const applyCategory = (category: TileCategory) => {
        commit(setTileCategory(latest.current, selected, category, canEdit));
    };

    const clearSelection = () => {
        commit(clearTileCategory(latest.current, selected, canEdit));
    };

    const setSolid = (solid: boolean) => {
        commit(setTileSolid(latest.current, selected, solid, canEdit));
    };

    // The tile is the default of the blank map, or stops being it when it
    // already was.
    const toggleBlankDefaultOf = (index: number) => {
        const on = latest.current[String(index)]?.blankDefault !== true;
        commit(setTileBlankDefault(latest.current, index, on));
    };

    const setTopOf = (index: number, top: number | null) => {
        commit(setTileTop(latest.current, index, top, canEdit));
    };

    // Paints the category and says whether the tiles are solid, so what is
    // painted is what the brush shows.
    const paintTiles = (
        brush: TileBrush,
        indices: number[],
        solid: boolean
    ) => {
        const painted = setTileCategory(
            latest.current,
            indices,
            brush,
            canEdit
        );
        commit(setTileSolid(painted, indices, solid, canEdit));
    };

    const eraseTiles = (indices: number[]) => {
        commit(clearTileCategory(latest.current, indices, canEdit));
    };

    // The edits of the wall piece panel, on the selected tiles.
    const setWallPieceOfSelected = (
        piece: WallPiece | null,
        fallbackStyle?: string
    ) => {
        commit(
            setWallPiece(
                latest.current,
                selected,
                piece,
                canEdit,
                fallbackStyle
            )
        );
    };

    const setWallStyleOfSelected = (name: string) => {
        commit(setWallStyle(latest.current, selected, name, canEdit));
    };

    const setWallOverlapOfSelected = (rows: number | null) => {
        commit(setWallOverlap(latest.current, selected, rows, canEdit));
    };

    const paintWallCells = (
        index: number,
        cells: WallCell[],
        action: WallPaintAction
    ) => {
        commit(
            paintWallCollision(latest.current, index, cells, action, canEdit)
        );
    };

    const clearWallCollisionOfSelected = () => {
        commit(clearWallCollision(latest.current, selected, canEdit));
    };

    return {
        latest,
        setWallPieceOfSelected,
        setWallStyleOfSelected,
        setWallOverlapOfSelected,
        paintWallCells,
        clearWallCollisionOfSelected,
        applyCategory,
        clearSelection,
        setSolid,
        toggleBlankDefaultOf,
        setTopOf,
        paintTiles,
        eraseTiles,
        history,
    };
};
