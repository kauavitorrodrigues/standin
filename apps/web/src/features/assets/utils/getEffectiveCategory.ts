import { ASSET_TYPES } from "@standin/contracts";

// Only a DECORATION has a category of its own, the other types take the
// default of their type. A category left over from a previous type is ignored.
export const getEffectiveCategory = (values: {
    type?: string;
    category?: string;
}) => (values.type === ASSET_TYPES.DECORATION ? (values.category ?? "") : "");
