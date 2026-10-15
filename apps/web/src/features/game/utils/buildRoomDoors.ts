import {
    ASSET_TYPES,
    TILE_SIZE,
    findDoorRoom,
    type AssetDefinition,
    type PlacedAsset,
    type Zone,
} from "@standin/contracts";
import type { GameRoomDoor } from "@/features/game/types/room";

type PlacedRef = Pick<
    PlacedAsset,
    "id" | "assetId" | "tileX" | "tileY" | "offsetX" | "offsetY"
>;
type AssetRef = Pick<AssetDefinition, "id" | "type" | "footprint">;

/**
 * The doors on the map, each tied to the room it closes. The anchor of a
 * placed object is the bottom left cell of its footprint, so the rows count
 * up from there, as for the seats. A door that reaches no room, or more than
 * one, is dropped: it would close nothing or two rooms at once.
 */
export const buildRoomDoors = (
    placed: readonly PlacedRef[],
    assetsById: ReadonlyMap<string, AssetRef>,
    zones: readonly Zone[]
): GameRoomDoor[] =>
    placed.flatMap((item) => {
        const asset = assetsById.get(item.assetId);
        if (!asset || asset.type !== ASSET_TYPES.DOOR) return [];

        const { w, h } = asset.footprint;
        const rect = {
            x: item.tileX * TILE_SIZE + item.offsetX,
            y: (item.tileY - h + 1) * TILE_SIZE + item.offsetY,
            width: w * TILE_SIZE,
            height: h * TILE_SIZE,
        };
        const match = findDoorRoom(rect, zones);
        if (match.status !== "room") return [];

        return [{ id: item.id, roomKey: match.roomKey, ...rect }];
    });
