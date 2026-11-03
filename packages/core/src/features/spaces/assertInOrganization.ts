import { SpaceNotFoundError } from "@standin/contracts";
import { findSpaceRefById } from "./findRefById";

/**
 * A space of another organization answers as a space that does not exist, so
 * the answer does not say which spaces exist.
 */
export const assertSpaceInOrganization = async (
    spaceId: string,
    organizationId: string
): Promise<void> => {
    const space = await findSpaceRefById(spaceId);
    const belongsToOrganization = space.organizationId === organizationId;
    if (!belongsToOrganization) throw new SpaceNotFoundError();
};
