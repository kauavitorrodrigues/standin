import {
    ServiceTokenOwnerInvalidError,
    USER_ROLES,
    type ServiceTokenScope,
} from "@standin/contracts";
import { ServiceTokenService } from "@standin/core";
import { findCachedUser } from "./findCachedUser";

// The token acts as the admin who created it. A token that cannot be used
// throws why (revoked, expired, out of scope), see the core service. Tokens
// are admin-only by design, so one whose owner is gone or is no longer an
// admin is refused with its own error.
export const authenticateFromServiceToken = async (
    token: string,
    scope: ServiceTokenScope
) => {
    const serviceToken = await ServiceTokenService.authenticate(token, scope);
    if (!serviceToken) return false;

    const owner = await findCachedUser(serviceToken.createdById);
    if (!owner || owner.role !== USER_ROLES.ADMIN) {
        throw new ServiceTokenOwnerInvalidError();
    }

    return owner;
};
