import type { PlacedAsset } from "../render/render-payload.schema";
import type { EditorLockHolder } from "../editor/types/editor-lock-holder";

// Emitted in the room of the space (`space:{id}`), or `map:{id}` for the map
// of a template, only after the transaction commits. A client that sees a
// jump in `version` fetches the render payload again.
export const MapEvents = {
    ASSET_PLACED: "asset_placed",
    ASSET_MOVED: "asset_moved",
    ASSET_REPLACED: "asset_replaced",
    ASSET_REMOVED: "asset_removed",
    DESK_CLAIMED: "desk_claimed",
    DESK_RELEASED: "desk_released",
    MAP_LOCKED: "map_locked",
    MAP_UNLOCKED: "map_unlocked",
    MAP_PUBLISHED: "map_published",
} as const;

export type AssetPlacedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetMovedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetReplacedPayload = { mapId: string; placed: PlacedAsset[] };
export type AssetRemovedPayload = {
    mapId: string;
    removedIds: string[];
    detachedIds: string[];
};
export type DeskPayload = { mapAssetId: string; userId: string };

export type MapLockedPayload = {
    mapId: string;
    by: EditorLockHolder;
    since: string;
};

export type MapUnlockedPayload = { mapId: string };
export type MapPublishedPayload = { mapId: string; version: number };

export type MapServerEvents = {
    asset_placed: (payload: AssetPlacedPayload) => void;
    asset_moved: (payload: AssetMovedPayload) => void;
    asset_replaced: (payload: AssetReplacedPayload) => void;
    asset_removed: (payload: AssetRemovedPayload) => void;
    desk_claimed: (payload: DeskPayload) => void;
    desk_released: (payload: DeskPayload) => void;
    map_locked: (payload: MapLockedPayload) => void;
    map_unlocked: (payload: MapUnlockedPayload) => void;
    map_published: (payload: MapPublishedPayload) => void;
};
