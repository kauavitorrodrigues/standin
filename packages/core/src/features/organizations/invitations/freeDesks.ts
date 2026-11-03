import type { FreeDesk } from "@standin/contracts";
import { SpaceService } from "../../spaces";
import { listDesksToKeep } from "./desks";

/** The desks of a space of the organization that can be kept for an invitation. */
export const listOrganizationInvitationDesks = async (
    organizationId: string,
    spaceId: string
): Promise<FreeDesk[]> => {
    await SpaceService.assertInOrganization(spaceId, organizationId);
    return listDesksToKeep(organizationId, spaceId);
};
