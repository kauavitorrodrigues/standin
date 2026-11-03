import { SEAL_PART_ENCODING, SEAL_PART_SEPARATOR } from "./consts";
import type { SealedParts } from "./types";

/** Writes the parts as one string that is safe in a column. */
export const joinSealedParts = ({ iv, authTag, body }: SealedParts): string =>
    [iv, authTag, body]
        .map((part) => part.toString(SEAL_PART_ENCODING))
        .join(SEAL_PART_SEPARATOR);

/** Reads what `joinSealedParts` wrote. Null when a part is missing. */
export const splitSealedParts = (sealed: string): SealedParts | null => {
    const [iv, authTag, body] = sealed
        .split(SEAL_PART_SEPARATOR)
        .map((part) => Buffer.from(part, SEAL_PART_ENCODING));

    const hasAllParts = !!iv && !!authTag && !!body;
    if (!hasAllParts) return null;

    return { iv, authTag, body };
};
