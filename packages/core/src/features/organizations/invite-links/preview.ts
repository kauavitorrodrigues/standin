import {
    isOrganizationInvitationToken,
    ORGANIZATION_MEMBER_ROLES,
} from "@standin/contracts";
import type {
    OrganizationInvitePreview,
    OrganizationInviteLinkRole,
} from "@standin/contracts";
import { assertLinkUsable } from "../../spaces/guests/invites/utils/assertLinkUsable";
import { OrganizationInvitationService } from "../invitations";
import { findLinkContext } from "./utils/findLinkContext";

/**
 * What the sign up page of a link shows. A link that cannot be used answers
 * with the reason, so the person sees it before filling the form.
 */
export const previewOrganizationInvite = async (
    token: string
): Promise<OrganizationInvitePreview> => {
    if (isOrganizationInvitationToken(token)) {
        const invitation = await OrganizationInvitationService.preview(token);
        return {
            organizationName: invitation.organizationName,
            inviterName: invitation.inviterName,
            role: ORGANIZATION_MEMBER_ROLES.MEMBER,
            email: invitation.email,
        };
    }

    const { link, organization, inviterName } = await findLinkContext(token);
    assertLinkUsable(link, new Date());

    return {
        organizationName: organization.name,
        inviterName,
        role: link.role as OrganizationInviteLinkRole,
        email: null,
    };
};
