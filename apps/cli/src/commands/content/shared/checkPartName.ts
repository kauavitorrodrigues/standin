import { MAX_SEED_PART_NAME_LENGTH } from "@standin/contracts";
import { CONTENT_MESSAGES, RESERVED_PART_NAME } from "../consts";

const ENCODER: TextEncoder = new TextEncoder();
const FORBIDDEN: RegExp = /["\r\n]/;

// The problem with a path as the name of a part of the upload, or undefined.
// The part is named by the path as library.json writes it, so these are the
// names the server cannot take (too long, with characters a header cannot
// carry) or that mean something else (`library`).
export const checkPartName = (name: string): string | undefined => {
    if (name === RESERVED_PART_NAME) return CONTENT_MESSAGES.partNameReserved;
    const bytes: number = ENCODER.encode(name).length;
    if (bytes > MAX_SEED_PART_NAME_LENGTH) {
        return CONTENT_MESSAGES.partNameTooLong(
            bytes,
            MAX_SEED_PART_NAME_LENGTH
        );
    }
    if (FORBIDDEN.test(name)) return CONTENT_MESSAGES.partNameCharacters;
    return undefined;
};
