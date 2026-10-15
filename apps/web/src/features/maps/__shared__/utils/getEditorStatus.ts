import { EDITOR_STATUS_KIND } from "@/features/maps/__shared__/consts/editor-status-kind";
import { LOCK_STATUS } from "@/features/editor/consts/lock-status";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import type { EditorBadgeStatus } from "@/features/maps/__shared__/types/editor-badge-status";
import type { EditorStatusInput } from "@/features/maps/__shared__/types/editor-status-input";

// What the status badge shows. A lost lock beats everything, then the publish
// phase, then whether the draft has changes.
export const getEditorStatus = ({
    hasChanges,
    publishPhase,
    lockStatus,
}: EditorStatusInput): EditorBadgeStatus => {
    if (lockStatus === LOCK_STATUS.LOST) {
        return { kind: EDITOR_STATUS_KIND.LOCK_LOST };
    }

    switch (publishPhase) {
        case PUBLISH_PHASE.PUBLISHING:
            return { kind: EDITOR_STATUS_KIND.PUBLISHING };
        case PUBLISH_PHASE.PUBLISHED:
            return { kind: EDITOR_STATUS_KIND.PUBLISHED };
        case PUBLISH_PHASE.ERROR:
            return { kind: EDITOR_STATUS_KIND.ERROR };
        case PUBLISH_PHASE.IDLE:
            break;
    }

    if (hasChanges) return { kind: EDITOR_STATUS_KIND.DRAFT };
    return { kind: EDITOR_STATUS_KIND.CLEAN };
};
