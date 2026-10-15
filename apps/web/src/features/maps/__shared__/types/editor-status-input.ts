import type { LockStatus } from "@/features/editor/types/lock-status";
import type { PublishPhase } from "@/features/editor/types/publish-phase";

export type EditorStatusInput = {
    hasChanges: boolean;
    publishPhase: PublishPhase;
    lockStatus: LockStatus["status"];
};
