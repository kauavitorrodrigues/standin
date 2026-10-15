import type { OrganizationMembership } from "@standin/contracts";
import type { MapOwner } from "./map-owner";

export type MapAccess = {
    mapId: string;
    owner: MapOwner;
    canRead: boolean;
    // Layout and objects. Members decorating their own desk are checked apart.
    canEdit: boolean;
    membership: OrganizationMembership | null;
};
