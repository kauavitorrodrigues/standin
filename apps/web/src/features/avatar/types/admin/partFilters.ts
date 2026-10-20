import type { AvatarSlot } from "@standin/contracts";
import type { FacetOption } from "./facetOption";

export type AvatarPartFilters = {
    slot?: AvatarSlot;
};

export type AvatarPartFacets = {
    slot: FacetOption[];
};
