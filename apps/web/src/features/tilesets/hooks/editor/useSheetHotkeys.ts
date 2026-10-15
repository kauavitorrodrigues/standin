import { useHotkey } from "@/hooks/useHotkey";
import { useHotkeyMap } from "@/hooks/useHotkeyMap";
import { TILE_CATEGORY_META } from "../../consts/categoryMeta";
import { TILE_EDITOR_KEYS } from "../../consts/editorKeys";
import type { TileCategory } from "../../types/meta";
import type { TileBrush, TileDirection, TileTool } from "../../types/sheet";

type Params = {
    enabled: boolean;
    onCategory: (category: TileCategory) => void;
    onBrush: (brush: TileBrush) => void;
    onClear: () => void;
    onToggleSolid: () => void;
    onNextUntagged: () => void;
    onTool: (tool: TileTool) => void;
    onEscape: () => void;
    onMove: (direction: TileDirection, extend: boolean) => void;
    onUndo: () => void;
    onRedo: () => void;
};

// The keys of the tile editor. 1 to 5 on the number row give the category to
// the selected tiles (or pick the brush, while a tool that paints is on). 1 to
// 5 on the numpad always pick the brush and go to painting, and 0 goes to the
// eraser. The arrows move the selection (with shift they add to it). Delete
// removes the category, N goes to the next tile with none, V, P, E, L, R, G, I,
// W, S, D, T and M switch the tool, Q toggles solid, ctrl+Z and ctrl+shift+Z undo and redo, and escape
// backs out of what is going on.
export const useTileSheetHotkeys = ({
    enabled,
    onCategory,
    onBrush,
    onClear,
    onToggleSolid,
    onNextUntagged,
    onTool,
    onEscape,
    onMove,
    onUndo,
    onRedo,
}: Params) => {
    useHotkeyMap(
        {
            ...Object.fromEntries(
                TILE_CATEGORY_META.flatMap(({ value, shortcut }) => [
                    [`digit${shortcut}`, () => onCategory(value)],
                    [`numpad${shortcut}`, () => onBrush(value)],
                ])
            ),
            numpad0: () => onTool("erase"),
            arrowup: (event) => onMove("up", event.shiftKey),
            arrowdown: (event) => onMove("down", event.shiftKey),
            arrowleft: (event) => onMove("left", event.shiftKey),
            arrowright: (event) => onMove("right", event.shiftKey),
            "mod+keyz": onUndo,
            "mod+shift+keyz": onRedo,
            "mod+keyy": onRedo,
        },
        { enabled }
    );
    useHotkey(TILE_EDITOR_KEYS.CLEAR_CATEGORY, onClear, { enabled });
    useHotkey(TILE_EDITOR_KEYS.NEXT_UNTAGGED, onNextUntagged, { enabled });
    useHotkey(TILE_EDITOR_KEYS.SELECT_TOOL, () => onTool("select"), {
        enabled,
    });
    useHotkey(TILE_EDITOR_KEYS.PAINT_TOOL, () => onTool("paint"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.ERASE_TOOL, () => onTool("erase"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.LINE_TOOL, () => onTool("line"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.RECT_TOOL, () => onTool("rect"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.BUCKET_TOOL, () => onTool("bucket"), {
        enabled,
    });
    useHotkey(TILE_EDITOR_KEYS.PICKER_TOOL, () => onTool("picker"), {
        enabled,
    });
    useHotkey(TILE_EDITOR_KEYS.WAND_TOOL, () => onTool("wand"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.SAME_TOOL, () => onTool("same"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.DEFAULT_TOOL, () => onTool("default"), {
        enabled,
    });
    useHotkey(TILE_EDITOR_KEYS.TOP_TOOL, () => onTool("top"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.PAN_TOOL, () => onTool("pan"), { enabled });
    useHotkey(TILE_EDITOR_KEYS.TOGGLE_SOLID, onToggleSolid, { enabled });
    useHotkey(TILE_EDITOR_KEYS.ESCAPE, onEscape, { enabled });
};
