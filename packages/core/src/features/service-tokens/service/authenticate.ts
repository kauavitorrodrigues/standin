import {
    ServiceTokenExpiredError,
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
    type ServiceToken,
    type ServiceTokenScope,
} from "@standin/contracts";
import { ServiceTokenRepository } from "../repository";
import { hasScope } from "../utils/hasScope";
import { hashToken } from "../utils/hashToken";
import { isTokenExpired } from "../utils/isTokenExpired";
import { shouldTouchLastUsed } from "../utils/shouldTouchLastUsed";

// Null when no token has this hash. A known token that cannot be used throws
// why: revoked, expired or without the scope.
export const authenticateServiceToken = async (
    token: string,
    scope: ServiceTokenScope
): Promise<ServiceToken | null> => {
    const serviceToken = await ServiceTokenRepository.findByHash(
        hashToken(token)
    );
    if (!serviceToken) return null;

    const now = new Date();
    if (serviceToken.revokedAt) throw new ServiceTokenRevokedError();
    if (isTokenExpired(serviceToken.expiresAt, now)) {
        throw new ServiceTokenExpiredError();
    }
    if (!hasScope(serviceToken.scopes, scope)) {
        throw new ServiceTokenScopeError(scope);
    }

    if (shouldTouchLastUsed(serviceToken.lastUsedAt, now)) {
        await ServiceTokenRepository.touchLastUsed(serviceToken.id, now);
    }
    return serviceToken;
};
