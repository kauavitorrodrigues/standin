import { createHash } from "node:crypto";
import { InviteLinkSecretMissingError } from "@standin/contracts";
import { SEAL_KEY_CONTEXT } from "./consts";

/**
 * The key comes from the server secret, apart from the one that signs sessions
 * (the context is mixed in), so a sealed value is readable only by this server.
 */
export const deriveSealKey = (): Buffer => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new InviteLinkSecretMissingError();

    return createHash("sha256")
        .update(`${SEAL_KEY_CONTEXT}:${secret}`)
        .digest();
};
