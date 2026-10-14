import { PUBLISH_ERROR_KIND } from "@/features/maps/__shared__/consts/publish";
import type { ClassifiedPublishError } from "@/features/maps/__shared__/types/publish-error";

// A 423 on publish means the lock is gone.
export const isPublishLockLost = (
    failure: ClassifiedPublishError | null
): boolean => failure?.kind === PUBLISH_ERROR_KIND.LOCK_LOST;
