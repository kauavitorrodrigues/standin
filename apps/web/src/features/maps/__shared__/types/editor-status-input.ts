import type { LockStatus } from "@/features/maps/__shared__/types/lock-status";
import type { PublishPhase } from "@/features/maps/__shared__/types/publish-phase";

export type EditorStatusInput = {
    hasChanges: boolean;
    publishPhase: PublishPhase;
    lockStatus: LockStatus["status"];
};
