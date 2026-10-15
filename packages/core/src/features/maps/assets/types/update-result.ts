import type { PlacedAsset } from "@standin/contracts";
import type { UPDATE_KINDS } from "../consts/update-kinds";

export type UpdateResult = {
    kind: (typeof UPDATE_KINDS)[keyof typeof UPDATE_KINDS];
    // Every row that changed, children included.
    placed: PlacedAsset[];
};
