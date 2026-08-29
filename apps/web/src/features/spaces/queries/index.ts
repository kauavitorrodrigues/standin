import {
    useOrganizationSpaces,
    useOrganizationSpacesQueryUtils,
} from "./useByOrganization";
import { useSpaceDetails, useSpaceDetailsQueryUtils } from "./useDetails";

export const SpacesQueries = {
    useByOrganization: useOrganizationSpaces,
    useByOrganizationUtils: useOrganizationSpacesQueryUtils,
    useDetails: useSpaceDetails,
    useDetailsUtils: useSpaceDetailsQueryUtils,
};
