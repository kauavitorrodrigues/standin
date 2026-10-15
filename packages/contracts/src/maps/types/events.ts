import type { LayoutOp } from "../layout/ops.schema";
import type { PlacedAsset } from "../render/render-payload.schema";

// Emitted in the room of the space (`space:{id}`), or `map:{id}` for the map
// of a template, only after the transaction commits. A client that sees a
// jump in `version` fetches the render payload again.
export const MapEvents = {
    LAYOUT_OPS_APPLIED: "layout_ops_applied",
    ASSET_PLACED: "asset_placed",
    ASSET_MOVED: "asset_moved",
    ASSET_REPLACED: "asset_replaced",
    ASSET_REMOVED: "asset_removed",
    DESK_CLAIMED: "desk_claimed",
    DESK_RELEASED: "desk_released",
} as const;

export type LayoutOpsAppliedPayload = {
    mapId: string;
    version: number;
    ops: LayoutOp[];
};

export type AssetPlacedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetMovedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetReplacedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetRemovedPayload = {
    mapId: string;
    removedIds: string[];
    detachedIds: string[];
};
export type DeskPayload = { mapAssetId: string; userId: string };

export type MapServerEvents = {
    layout_ops_applied: (payload: LayoutOpsAppliedPayload) => void;
    asset_placed: (payload: AssetPlacedPayload) => void;
    asset_moved: (payload: AssetMovedPayload) => void;
    asset_replaced: (payload: AssetReplacedPayload) => void;
    asset_removed: (payload: AssetRemovedPayload) => void;
    desk_claimed: (payload: DeskPayload) => void;
    desk_released: (payload: DeskPayload) => void;
};
