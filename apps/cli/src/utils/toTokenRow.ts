import type { ServiceToken } from "@standin/contracts";
import type { TokenRow } from "../types";
import { resolveTokenStatus } from "./resolveTokenStatus";

// What the CLI shows of a token. The clear token is not in a ServiceToken.
export const toTokenRow = (token: ServiceToken, now: Date): TokenRow => ({
    id: token.id,
    name: token.name,
    prefix: token.tokenPrefix,
    scopes: token.scopes,
    status: resolveTokenStatus(token, now),
    expiresAt: token.expiresAt,
    lastUsedAt: token.lastUsedAt,
    createdAt: token.createdAt,
});
