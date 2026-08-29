import {
    useOrganizationSpaces,
    useOrganizationSpacesQueryUtils,
} from "./useByOrganization";

export const SpacesQueries = {
    useByOrganization: useOrganizationSpaces,
    useByOrganizationUtils: useOrganizationSpacesQueryUtils,
};
