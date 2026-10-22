import type { NextFunction, Response } from "express";
import { OrganizationService, SpaceService } from "@standin/core";
import {
    ORGANIZATION_MEMBER_ROLES,
    SpaceNotFoundError,
} from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import { sendError, sendForbiddenError } from "@/utils/sendError";
import { parseSchema } from "@/utils/parseSchema";
import { paramsSchema } from "@/utils/paramsSchema";

// A space that does not exist is no reason to fail: it answers like any
// other space the person has nothing to do with. Anything else is a real
// error and keeps being one.
const findSpaceRef = async (spaceId: string) => {
    try {
        return await SpaceService.findRefById(spaceId);
    } catch (error) {
        if (error instanceof SpaceNotFoundError) return null;
        throw error;
    }
};

/**
 * For the routes that run the guests of a space. A host is a member of the
 * organization of the space, and only the owner makes the links and turns guest
 * access on or off. A guest, a stranger and a space that does not exist all get
 * the same 403, so the answer does not say which spaces exist.
 */
const requiresSpaceMembership =
    (ownerOnly: boolean) =>
    async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user) return sendForbiddenError(res);

        const params = parseSchema(paramsSchema("spaceId"), req.params, res);
        if (!params) return;

        try {
            const ref = await findSpaceRef(params.spaceId);
            if (!ref) return sendForbiddenError(res);

            const membership = await OrganizationService.findMembership(
                req.user.id,
                ref.organizationId
            );
            if (!membership) return sendForbiddenError(res);
            if (
                ownerOnly &&
                membership.role !== ORGANIZATION_MEMBER_ROLES.OWNER
            ) {
                return sendForbiddenError(res);
            }

            req.spaceRef = ref;
            req.organizationMembership = membership;
            next();
        } catch (error) {
            return sendError({
                res,
                resource: "space",
                action: "read",
                reportError: error,
            });
        }
    };

export const RequiresSpaceHost = requiresSpaceMembership(false);
export const RequiresSpaceOwner = requiresSpaceMembership(true);
