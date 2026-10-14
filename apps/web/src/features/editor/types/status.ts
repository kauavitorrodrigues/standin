import type { EDITOR_STATUS } from "@/features/editor/consts/status";

export type EditorStatus = (typeof EDITOR_STATUS)[keyof typeof EDITOR_STATUS];
