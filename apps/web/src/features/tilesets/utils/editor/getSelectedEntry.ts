import type { TileMeta } from "@standin/contracts";

// What the only selected tile says, or nothing when several (or none) are.
export const getSelectedEntry = (meta: TileMeta, single: number | null) => {
    if (single === null) return undefined;
    return meta[String(single)];
};
