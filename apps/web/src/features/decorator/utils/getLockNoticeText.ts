import type { EditorLockLostReason } from "@standin/contracts";
import { DECORATOR_LOCK_NOTICE_MESSAGES } from "@/features/decorator/consts/messages";

// What the notice says about why the decorator went read only. The Studio
// opening over it has its own words, every other loss uses the general one.
export const getLockNoticeText = (reason: EditorLockLostReason | null) => {
    switch (reason) {
        case "MAP_EDITING":
            return DECORATOR_LOCK_NOTICE_MESSAGES.STUDIO;
        default:
            return DECORATOR_LOCK_NOTICE_MESSAGES.LOST;
    }
};
