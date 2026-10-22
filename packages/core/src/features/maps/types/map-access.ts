import type { OrganizationMembership } from "@standin/contracts";
import type { AdmittedGuest } from "../../spaces/guests/types";
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
    // The pass of an admitted guest of the space, when the person is not a
    // member. A guest never reads, edits or decorates: the guest only views.
    guest: AdmittedGuest | null;
    // Members and admitted guests can see the space and render its map.
    canView: boolean;
};
