import type { EditorLockErrorCode, EditorLockHolder } from "@standin/contracts";
import type { LOCK_STATUS } from "@/features/maps/__shared__/consts/lock-status";

export type LockStatus =
    | { status: typeof LOCK_STATUS.ACQUIRING }
    | { status: typeof LOCK_STATUS.HELD }
    | {
          status: typeof LOCK_STATUS.DENIED;
          code: EditorLockErrorCode;
          by?: EditorLockHolder;
          since?: string;
      }
    | { status: typeof LOCK_STATUS.LOST };
