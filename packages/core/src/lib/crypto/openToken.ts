import { createDecipheriv } from "node:crypto";
import { SEAL_ALGORITHM } from "./consts";
import { deriveSealKey } from "./deriveSealKey";
import { splitSealedParts } from "./sealedParts";
import type { SealedTokenColumn } from "./types";

/** Opens what `sealToken` made. Null when this server did not make it. */
export const openToken = (sealed: string): string | null => {
    const parts = splitSealedParts(sealed);
    if (!parts) return null;

    try {
        const decipher = createDecipheriv(
            SEAL_ALGORITHM,
            deriveSealKey(),
            parts.iv
        );
        decipher.setAuthTag(parts.authTag);
        return Buffer.concat([
            decipher.update(parts.body),
            decipher.final(),
        ]).toString("utf8");
    } catch {
        // A wrong key or a damaged value: the link has to be reset.
        return null;
    }
};

/** The token a row kept, or null when it kept none or it cannot be opened. */
export const readSealedToken = (
    row: SealedTokenColumn | undefined
): string | null => {
    if (!row?.tokenEncrypted) return null;
    return openToken(row.tokenEncrypted);
};
