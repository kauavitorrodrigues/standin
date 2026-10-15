import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorTool } from "@/features/editor/types/tool";

// The keys of the map editor, matched against `event.key` in lower case. The
// tool keys, and H for the side panel, are the same as the ones in the tile
// editor.
export const MAP_EDITOR_KEYS = {
    SELECT_TOOL: ["v"],
    PAINT_TOOL: ["p"],
    ERASE_TOOL: ["e"],
    RECT_TOOL: ["r"],
    BUCKET_TOOL: ["g"],
    PICKER_TOOL: ["i"],
    PAN_TOOL: ["m"],
    ZONE_TOOL: ["z"],
    TOGGLE_PANEL: ["h"],
    TOGGLE_GRID: ["c"],
    TOGGLE_ZONES: ["a"],
    ZOOM_IN: ["+", "="],
    ZOOM_OUT: ["-"],
    FIT: ["0"],
    ROTATE: ["o"],
    DELETE: ["delete", "backspace"],
    ESCAPE: ["escape"],
    MOVE_UP: ["arrowup"],
    MOVE_DOWN: ["arrowdown"],
    MOVE_LEFT: ["arrowleft"],
    MOVE_RIGHT: ["arrowright"],
} as const;

// The key combos, in the names `useHotkeyMap` gives them ("mod" is ctrl or
// cmd). They are matched by the physical key.
export const MAP_EDITOR_COMBOS = {
    UNDO: "mod+keyz",
    REDO: "mod+shift+keyz",
    REDO_ALT: "mod+keyy",
    PUBLISH: "mod+keys",
    COPY: "mod+keyc",
    PASTE: "mod+keyv",
} as const;

export const MAP_TOOL_KEYS: Readonly<Record<EditorTool, readonly string[]>> = {
    [EDITOR_TOOLS.PAN]: MAP_EDITOR_KEYS.PAN_TOOL,
    [EDITOR_TOOLS.SELECT]: MAP_EDITOR_KEYS.SELECT_TOOL,
    [EDITOR_TOOLS.PAINT]: MAP_EDITOR_KEYS.PAINT_TOOL,
    [EDITOR_TOOLS.ERASE]: MAP_EDITOR_KEYS.ERASE_TOOL,
    [EDITOR_TOOLS.RECT]: MAP_EDITOR_KEYS.RECT_TOOL,
    [EDITOR_TOOLS.BUCKET]: MAP_EDITOR_KEYS.BUCKET_TOOL,
    [EDITOR_TOOLS.PICKER]: MAP_EDITOR_KEYS.PICKER_TOOL,
    [EDITOR_TOOLS.ZONE]: MAP_EDITOR_KEYS.ZONE_TOOL,
};
