import { useOrganizations, useOrganizationsQueryUtils } from "./organizations";
import { useOrganizationMembers } from "./members";

export const OrganizationsQueries = {
    useAll: useOrganizations,
    useAllUtils: useOrganizationsQueryUtils,
    useMembers: useOrganizationMembers,
};
