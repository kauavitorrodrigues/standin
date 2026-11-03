import { createHash } from "node:crypto";
import { InviteLinkSecretMissingError } from "@standin/contracts";
import { SEAL_KEY_CONTEXT } from "./consts";

/**
 * The key comes from its own secret, `INVITE_LINK_SECRET`, and never from the
 * one that signs sessions: rotating one does not touch the other. A sealed
 * value is readable only by a server that has the same secret.
 */
export const deriveSealKey = (): Buffer => {
    const secret = process.env.INVITE_LINK_SECRET;
    if (!secret) throw new InviteLinkSecretMissingError();

    return createHash("sha256")
        .update(`${SEAL_KEY_CONTEXT}:${secret}`)
        .digest();
};
