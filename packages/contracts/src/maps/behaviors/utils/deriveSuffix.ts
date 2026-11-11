import { EMBEDDED_WEBSITE_SUFFIX_LENGTH } from "../consts";

// FNV-1a over the object id: the same object always gets the same suffix, and
// no random source or clock is involved.
export const deriveSuffix = (objectId: string): string => {
    let hash = 0x811c9dc5;
    for (let index = 0; index < objectId.length; index += 1) {
        hash ^= objectId.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash
        .toString(36)
        .padStart(EMBEDDED_WEBSITE_SUFFIX_LENGTH, "0")
        .slice(-EMBEDDED_WEBSITE_SUFFIX_LENGTH);
};
