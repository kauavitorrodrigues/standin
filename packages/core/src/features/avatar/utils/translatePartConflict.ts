import {
    AvatarPartKeyTakenError,
    AvatarVariationColorTakenError,
} from "@standin/contracts";
import {
    FAMILY_COLOR_UNIQUE_INDEX,
    UNIQUE_VIOLATION_CODE,
} from "../consts/database";

type DatabaseError = {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
};

/**
 * The unique indexes are the last line of defense against two writes racing
 * for the same key or for the same color of a family.
 */
export const translatePartConflict = (error: unknown): never => {
    const { code, constraint, cause } = error as DatabaseError;
    if ((code ?? cause?.code) !== UNIQUE_VIOLATION_CODE) throw error;

    switch (constraint ?? cause?.constraint) {
        case FAMILY_COLOR_UNIQUE_INDEX:
            throw new AvatarVariationColorTakenError();
        default:
            throw new AvatarPartKeyTakenError();
    }
};
