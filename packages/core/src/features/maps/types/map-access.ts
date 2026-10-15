import type { OrganizationMembership } from "@standin/contracts";
import type { MapOwner } from "./map-owner";

export type MapAccess = {
    mapId: string;
    owner: MapOwner;
    canRead: boolean;
    // Layout and objects of the whole map: the Studio.
    canEdit: boolean;
    // Objects only: the decorator. Any active member of the organization of the
    // space, the owner included. Never true for a template map.
    canDecorate: boolean;
    membership: OrganizationMembership | null;
};
