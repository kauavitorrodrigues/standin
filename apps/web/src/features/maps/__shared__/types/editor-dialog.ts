import type { EDITOR_DIALOG } from "@/features/maps/__shared__/consts/editor-dialog";

export type EditorDialog = (typeof EDITOR_DIALOG)[keyof typeof EDITOR_DIALOG];
