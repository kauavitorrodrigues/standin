import type {
    EditorLockErrorCode,
    EditorLockHolder,
    EditScopeKind,
} from "@standin/contracts";
import type { LOCK_STATUS } from "@/features/editor/consts/lock-status";

export type LockStatus =
    | { status: typeof LOCK_STATUS.ACQUIRING }
    | { status: typeof LOCK_STATUS.HELD }
    | {
          status: typeof LOCK_STATUS.DENIED;
          code: EditorLockErrorCode;
          by?: EditorLockHolder;
          since?: string;
          // What the holder is doing: the Studio (`map`) or a decorator.
          mode?: EditScopeKind;
      }
    | { status: typeof LOCK_STATUS.LOST };
