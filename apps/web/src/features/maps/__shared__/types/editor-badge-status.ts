import type { EDITOR_STATUS_KIND } from "@/features/maps/__shared__/consts/editor-status-kind";

export type EditorBadgeStatus =
    | { kind: typeof EDITOR_STATUS_KIND.CLEAN }
    | { kind: typeof EDITOR_STATUS_KIND.DRAFT }
    | { kind: typeof EDITOR_STATUS_KIND.PUBLISHING }
    | { kind: typeof EDITOR_STATUS_KIND.PUBLISHED }
    | { kind: typeof EDITOR_STATUS_KIND.ERROR }
    | { kind: typeof EDITOR_STATUS_KIND.LOCK_LOST };
