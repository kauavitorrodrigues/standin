import { createCipheriv, randomBytes } from "node:crypto";
import { SEAL_ALGORITHM, SEAL_CONTEXTS, SEAL_IV_BYTES } from "./consts";
import type { SealContext } from "./types";
import { deriveSealKey } from "./deriveSealKey";
import { joinSealedParts } from "./sealedParts";

/**
 * Seals a token so the owner can copy it again later. The context says what
 * the value is for, and only the same context opens it.
 */
export const sealToken = (
    token: string,
    context: SealContext = SEAL_CONTEXTS.INVITE_LINK
): string => {
    const iv = randomBytes(SEAL_IV_BYTES);
    const cipher = createCipheriv(SEAL_ALGORITHM, deriveSealKey(context), iv);
    const body = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

    return joinSealedParts({ iv, authTag: cipher.getAuthTag(), body });
};
