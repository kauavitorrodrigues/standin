import type { EDITOR_STATUS } from "@/features/maps/__shared__/consts/status";

export type EditorStatus = (typeof EDITOR_STATUS)[keyof typeof EDITOR_STATUS];
