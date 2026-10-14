import type { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";

export type EditorTool = (typeof EDITOR_TOOLS)[keyof typeof EDITOR_TOOLS];
