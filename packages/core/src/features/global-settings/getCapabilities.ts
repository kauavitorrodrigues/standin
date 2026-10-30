import { USER_ROLES } from "@standin/contracts";
import type { GlobalCapabilities, User } from "@standin/contracts";
import { getGlobalSettings } from "./get";

/** What the switches let this person create, for the web to hide the rest. */
export const getGlobalCapabilities = async (
    user: Pick<User, "role">
): Promise<GlobalCapabilities> => {
    if (user.role === USER_ROLES.ADMIN) {
        return { canCreateOrganization: true, canCreateSpace: true };
    }

    const { allowOrganizationCreation, allowSpaceCreation } =
        await getGlobalSettings();
    return {
        canCreateOrganization: allowOrganizationCreation,
        canCreateSpace: allowSpaceCreation,
    };
};
