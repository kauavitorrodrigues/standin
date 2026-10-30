import type { ServiceToken } from "@standin/contracts";
import type { TokenStatus } from "../types";

// Revoked wins over expired: a revocation is a decision of an admin.
export const resolveTokenStatus = (
    token: Pick<ServiceToken, "revokedAt" | "expiresAt">,
    now: Date
): TokenStatus => {
    if (token.revokedAt) return "revoked";
    if (token.expiresAt && new Date(token.expiresAt) <= now) return "expired";
    return "active";
};
