import { AvatarBaseKeyTakenError } from "@standin/contracts";
import { UNIQUE_VIOLATION_CODE } from "../../consts/database";

type DatabaseError = { code?: string; cause?: { code?: string } };

/**
 * The unique index on `key` is the last line of defense against two creations
 * racing for the same key.
 */
export const translateBaseKeyConflict = (error: unknown): never => {
    const { code, cause } = error as DatabaseError;
    if ((code ?? cause?.code) === UNIQUE_VIOLATION_CODE) {
        throw new AvatarBaseKeyTakenError();
    }
    throw error;
};
