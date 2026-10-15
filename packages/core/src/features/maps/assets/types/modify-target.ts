import type { AssetDef } from "./asset-def";

// What an operation touches, to decide whether the user may do it.
export type ModifyTarget = {
    placement: AssetDef["placement"];
    parentRowId: string | null;
};
