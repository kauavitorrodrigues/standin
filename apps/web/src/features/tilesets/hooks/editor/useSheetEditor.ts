import { useRef, useState } from "react";
import { TILE_CATEGORIES, type TileMeta } from "@standin/contracts";
import { TILE_ENTRY_EDIT_STATES } from "../../consts/entryEditStates";
import { DEFAULT_TILE_ZOOM, type TileZoom } from "../../consts/sheetZoom";
import type { TileCategory } from "../../types/meta";
import type {
    TileBrush,
    TileFilter,
    TileSheetGrid,
    TileTool,
} from "../../types/sheet";
import { getFillArea } from "../../utils/editor/getFillArea";
import { getTileBrush } from "../../utils/editor/getBrush";
import { getTileEntryEditState } from "../../utils/editor/getEntryEditState";
import { getToolPreview } from "../../utils/editor/getToolPreview";
import { canHaveTop } from "../../utils/editor/categoryRules";
import { usesBrush } from "../../utils/editor/toolRules";
import { useRevealTile } from "./useReveal";
import { useTileMetaActions } from "./useMetaActions";
import { useTileSelection } from "./useSelection";
import { useTileSheetHotkeys } from "./useSheetHotkeys";
import { useTileSheetPan } from "./useSheetPan";
import { useTileSheetPointer } from "./useSheetPointer";
import { useTileSheetZoom } from "./useSheetZoom";

type Params = {
    grid: TileSheetGrid;
    meta: TileMeta;
    onChange: (meta: TileMeta) => void;
    // What is stored, when the tileset already exists, and whether maps paint
    // with it. A tile that maps use only accepts a change of `blankDefault`.
    savedMeta: TileMeta | null;
    imageInUse: boolean;
    disabled: boolean;
};

// All the state of the tile editor, put together from smaller hooks: the
// selection, the changes to the marks (with undo and redo), the zoom, and what
// the pointer and the keyboard do over the sheet. It adds the tool in use and
// what the tools that paint need. It opens with the hand, so nothing is
// changed by a click until another tool is picked.
export const useTileSheetEditor = ({
    grid,
    meta,
    onChange,
    savedMeta,
    imageInUse,
    disabled,
}: Params) => {
    const [zoom, setZoom] = useState<TileZoom>(DEFAULT_TILE_ZOOM);
    const [tool, setTool] = useState<TileTool>("pan");
    const [brush, setBrush] = useState<TileBrush>(TILE_CATEGORIES.FLOOR);
    // Whether the bucket fills only the tiles that touch the one clicked.
    const [contiguous, setContiguous] = useState(true);
    const [filter, setFilter] = useState<TileFilter>(null);
    // Whether the tiles the brush paints are solid.
    const [brushSolid, setBrushSolid] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const reveal = useRevealTile({ scrollRef, zoom, grid });
    const selection = useTileSelection({ grid, meta, reveal });
    const { selected, single } = selection;

    const canEdit = (index: number) =>
        getTileEntryEditState(imageInUse, savedMeta, index) ===
        TILE_ENTRY_EDIT_STATES.FULL;

    const actions = useTileMetaActions({ meta, onChange, canEdit, selected });
    const preview = getToolPreview({
        tool,
        hovered: selection.hovered,
        meta,
        grid,
        contiguous,
    });

    // The top tool: a click picks the wall, the next one on another tile is
    // its top, and a click on the wall again takes its top away.
    const pickTop = (index: number) => {
        const wall = single === null ? undefined : meta[String(single)];
        if (single === null || !wall || !canHaveTop(wall.category)) {
            const entry = meta[String(index)];
            if (entry && canHaveTop(entry.category))
                selection.setSelected([index]);
            return;
        }
        selection.setSelected([]);
        if (index === single) return actions.setTopOf(single, null);
        actions.setTopOf(single, index);
    };

    const paint = (paintBrush: TileBrush, indices: number[]) => {
        actions.paintTiles(paintBrush, indices, brushSolid);
    };

    const fill = (fillBrush: TileBrush, index: number) => {
        const area = getFillArea(
            actions.latest.current,
            index,
            grid,
            contiguous
        );
        paint(fillBrush, area);
    };

    // The picker takes the brush of a tile, solid included, and goes back to
    // painting with it, or to the eraser when the tile has nothing to take.
    const pickBrush = (index: number) => {
        const picked = getTileBrush(actions.latest.current, index);
        if (picked === null) return setTool("erase");
        setBrush(picked);
        setBrushSolid(actions.latest.current[String(index)]?.solid === true);
        setTool("paint");
    };

    const { panMode } = useTileSheetPan({ scrollRef, tool });

    const { zoomAtCenter } = useTileSheetZoom({
        scrollRef,
        zoom,
        sheetWidthPx: grid.widthPx,
        onZoomChange: setZoom,
    });

    const pointerHandlers = useTileSheetPointer({
        grid,
        zoom,
        tool,
        brush,
        disabled,
        selected,
        onSelect: selection.setSelected,
        onHover: selection.setHovered,
        onPaint: paint,
        onErase: actions.eraseTiles,
        onFill: fill,
        onPickBrush: pickBrush,
        onDefault: actions.toggleBlankDefaultOf,
        onTop: pickTop,
        onWand: selection.selectTouching,
        onSame: selection.selectSameCategory,
        onStrokeStart: actions.history.beginStroke,
        onStrokeEnd: actions.history.endStroke,
    });

    // The category becomes the brush, and, when the tool does not paint, it is
    // also given to the selected tiles.
    const chooseCategory = (category: TileCategory) => {
        setBrush(category);
        if (usesBrush(tool) || selected.length === 0) return;
        actions.applyCategory(category);
    };

    // Same for solid: it is what the brush paints, and, when the tool does not
    // paint, what the selected tiles become.
    const chooseSolid = (solid: boolean) => {
        setBrushSolid(solid);
        if (usesBrush(tool) || selected.length === 0) return;
        actions.setSolid(solid);
    };

    // The numpad picks the brush and makes sure a tool that paints is on, so
    // 1 to 5 there go through the types without leaving the sheet.
    const pickBrushByKey = (next: TileBrush) => {
        setBrush(next);
        if (!usesBrush(tool)) setTool("paint");
    };

    const escape = () => {
        selection.setSelected([]);
    };

    useTileSheetHotkeys({
        enabled: !disabled,
        onCategory: chooseCategory,
        onBrush: pickBrushByKey,
        onClear: actions.clearSelection,
        onToggleSolid: () => chooseSolid(!brushSolid),
        onNextUntagged: selection.selectNextUntagged,
        onTool: setTool,
        onEscape: escape,
        onMove: selection.moveSelection,
        onUndo: actions.history.undo,
        onRedo: actions.history.redo,
    });

    return {
        zoom,
        setZoom: zoomAtCenter,
        tool,
        setTool,
        brush,
        setBrush,
        contiguous,
        setContiguous,
        selected: selection.selected,
        setSelected: selection.setSelected,
        single,
        selectedEntry: selection.selectedEntry,
        hovered: selection.hovered,
        preview,
        filter,
        setFilter,
        brushSolid,
        panMode,
        scrollRef,
        canEdit,
        chooseCategory,
        chooseSolid,
        clearSelection: actions.clearSelection,
        selectNextUntagged: selection.selectNextUntagged,
        pointerHandlers,
        canUndo: actions.history.canUndo,
        canRedo: actions.history.canRedo,
        undo: actions.history.undo,
        redo: actions.history.redo,
    };
};
