import { useOrganizations, useOrganizationsQueryUtils } from "./organizations";

export const OrganizationsQueries = {
    useAll: useOrganizations,
    useAllUtils: useOrganizationsQueryUtils,
};
