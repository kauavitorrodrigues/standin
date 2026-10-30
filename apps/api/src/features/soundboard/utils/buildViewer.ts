import { ORGANIZATION_MEMBER_ROLES, USER_ROLES } from "@standin/contracts";
import type { SoundboardViewer } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";

/**
 * Who is asking, from the session and the membership the middlewares already
 * checked. The admin has no implicit access to an organization, so being the
 * owner is the membership alone.
 */
export const buildViewer = (req: ExtendedRequest): SoundboardViewer | null => {
    if (!req.user) return null;

    return {
        userId: req.user.id,
        isPlatformAdmin: req.user.role === USER_ROLES.ADMIN,
        isOrganizationOwner:
            req.organizationMembership?.role ===
            ORGANIZATION_MEMBER_ROLES.OWNER,
    };
};

/** The organization of the URL, or null on the default clips mount. */
export const scopeOf = (req: ExtendedRequest): string | null =>
    req.organizationMembership?.organizationId ?? null;
