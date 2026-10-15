import type { EDITOR_TOOLS } from "@/features/editor/consts/tools";

export type EditorTool = (typeof EDITOR_TOOLS)[keyof typeof EDITOR_TOOLS];
