import { DeskUserNotMemberError } from "@standin/contracts";
import { OrganizationService } from "../../../organizations";

export const assertActiveMember = async (
    userId: string,
    organizationId: string
) => {
    const isMember = await OrganizationService.hasActiveMembership(
        userId,
        organizationId
    );
    if (!isMember) throw new DeskUserNotMemberError();
};
