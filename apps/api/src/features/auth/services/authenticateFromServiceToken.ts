import type { ServiceTokenScope } from "@standin/contracts";
import { ServiceTokenService } from "@standin/core";
import { findCachedUser } from "./findCachedUser";

// The token acts as the admin who created it. A token that cannot be used
// throws why (revoked, expired, out of scope), see the core service.
export const authenticateFromServiceToken = async (
    token: string,
    scope: ServiceTokenScope
) => {
    const serviceToken = await ServiceTokenService.authenticate(token, scope);
    if (!serviceToken) return false;

    return findCachedUser(serviceToken.createdById);
};
