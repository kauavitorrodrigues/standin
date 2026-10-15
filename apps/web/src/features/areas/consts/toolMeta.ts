import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { MAP_TOOL_META } from "@/features/editor/consts/toolMeta";
import type { EditorToolMeta } from "@/features/editor/types/tool-meta";

// The tools of the map editor but the zone one: an area gets its zone from the
// box in the side panel, and has no spawn.
export const AREA_TOOL_META: readonly EditorToolMeta[] = MAP_TOOL_META.filter(
    (tool) => tool.value !== EDITOR_TOOLS.ZONE
);
