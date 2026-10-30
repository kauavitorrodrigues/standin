import type {
    OrganizationInvitePreview,
    OrganizationInviteLinkRole,
} from "@standin/contracts";
import { assertLinkUsable } from "../../spaces/guests/invites/utils/assertLinkUsable";
import { findLinkContext } from "./utils/findLinkContext";

/**
 * What the sign up page of a link shows. A link that cannot be used answers
 * with the reason, so the person sees it before filling the form.
 */
export const previewOrganizationInvite = async (
    token: string
): Promise<OrganizationInvitePreview> => {
    const { link, organization, inviterName } = await findLinkContext(token);
    assertLinkUsable(link, new Date());

    return {
        organizationName: organization.name,
        inviterName,
        role: link.role as OrganizationInviteLinkRole,
    };
};
