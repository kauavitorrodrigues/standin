import { OrganizationsQueries } from "@/features/organizations/queries";
import { buildNameLookup } from "@/features/spaces/utils/buildStageTiles";

// The name of every member of the organization by id. A sender that is not in
// it is not resolved, and its line is left out of the list.
export const useNearbyNames = (): Map<string, string> => {
    const { members } = OrganizationsQueries.useMembers();

    return buildNameLookup(members);
};
