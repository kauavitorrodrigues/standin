import type { ServiceToken } from "@standin/contracts";
import type { ServiceTokenStatus } from "../types";

type Params = Pick<ServiceToken, "revokedAt" | "expiresAt">;

// A revoked token stays revoked even after its expiry date passes.
export const getTokenStatus = (
    token: Params,
    now: Date = new Date()
): ServiceTokenStatus => {
    if (token.revokedAt) return "revoked";
    if (token.expiresAt && new Date(token.expiresAt).getTime() <= now.getTime())
        return "expired";
    return "active";
};
