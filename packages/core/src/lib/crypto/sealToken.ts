import { createCipheriv, randomBytes } from "node:crypto";
import { SEAL_ALGORITHM, SEAL_IV_BYTES } from "./consts";
import { deriveSealKey } from "./deriveSealKey";
import { joinSealedParts } from "./sealedParts";

/** Seals a token so the owner can copy it again later. */
export const sealToken = (token: string): string => {
    const iv = randomBytes(SEAL_IV_BYTES);
    const cipher = createCipheriv(SEAL_ALGORITHM, deriveSealKey(), iv);
    const body = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);

    return joinSealedParts({ iv, authTag: cipher.getAuthTag(), body });
};
