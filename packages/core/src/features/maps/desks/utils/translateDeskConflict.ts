import type { DatabaseError } from "../types/database-error";
import {
    DeskAlreadyClaimedError,
    UserAlreadyHasDeskError,
} from "@standin/contracts";
import {
    UNIQUE_VIOLATION_CODE,
    USER_DESK_INDEX_MARKER,
} from "../consts/database";

/** The unique indexes are the last line of defense against a race. */
export const translateDeskConflict = (error: unknown): never => {
    const { code, constraint, cause } = error as DatabaseError;
    const violated = (code ?? cause?.code) === UNIQUE_VIOLATION_CODE;
    if (!violated) throw error;

    const indexName = String(constraint ?? cause?.constraint ?? "");
    throw indexName.includes(USER_DESK_INDEX_MARKER)
        ? new UserAlreadyHasDeskError()
        : new DeskAlreadyClaimedError();
};
