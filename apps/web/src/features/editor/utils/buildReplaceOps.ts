import type { EditorOp } from "@standin/contracts";

// One replace_asset: the object keeps its place and takes another asset.
export const buildReplaceOps = (id: string, assetId: string): EditorOp[] => [
    { type: "replace_asset", id, assetId },
];
