import type { NextFunction, Response } from "express";
import { OrganizationService, SpaceService } from "@standin/core";
import {
    canInviteGuests,
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

type SpaceRef = NonNullable<ExtendedRequest["spaceRef"]>;
type Membership = NonNullable<ExtendedRequest["organizationMembership"]>;

// Who a route lets in, from the role and the space.
type Rule = (membership: Membership, ref: SpaceRef) => boolean;

const anyHost: Rule = () => true;

const ownerOnly: Rule = ({ role }) => role === ORGANIZATION_MEMBER_ROLES.OWNER;

// The owner always; a member when the space lets members invite.
const inviter: Rule = ({ role }, { membersCanInvite }) =>
    canInviteGuests(role, membersCanInvite);

/**
 * For the routes that run the guests of a space. A host is a member of the
 * organization of the space. Only the owner turns guest access on or off and
 * resets the link; the link itself is also open to members when the space
 * allows it. A guest, a stranger and a space that does not exist all get the
 * same 403, so the answer does not say which spaces exist.
 */
const requiresSpaceMembership =
    (allows: Rule) =>
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
            if (!allows(membership, ref)) return sendForbiddenError(res);

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

export const RequiresSpaceHost = requiresSpaceMembership(anyHost);
export const RequiresSpaceOwner = requiresSpaceMembership(ownerOnly);
export const RequiresSpaceInviter = requiresSpaceMembership(inviter);
