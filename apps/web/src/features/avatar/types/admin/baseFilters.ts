import type { AvatarBaseKind } from "@standin/contracts";
import type { FacetOption } from "./facetOption";

export type AvatarBaseFilters = {
    kind?: AvatarBaseKind;
    hasPreview?: boolean;
};

export type AvatarBaseFacets = {
    kind: FacetOption[];
    preview: FacetOption[];
};
