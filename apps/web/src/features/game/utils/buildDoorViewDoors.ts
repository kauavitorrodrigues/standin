import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import type { RoomDoorViewDoor } from "@/features/game/renderers/RoomDoorView";
import type { GameRoomDoor } from "@/features/game/types/room";

const NO_ANIMATION_FRAMES = 0;

// What the door view needs of each door: the asset that animates it and how
// many frames the animation has.
export const buildDoorViewDoors = (
    doors: readonly GameRoomDoor[],
    placed: readonly PlacedAsset[],
    assetsById: ReadonlyMap<string, Pick<AssetDefinition, "animation">>
): RoomDoorViewDoor[] => {
    const assetIdByPlacedId = new Map(
        placed.map((item) => [item.id, item.assetId])
    );

    return doors.flatMap((door) => {
        const assetId = assetIdByPlacedId.get(door.id);
        if (assetId === undefined) return [];

        return [
            {
                id: door.id,
                roomKey: door.roomKey,
                assetId,
                frameCount:
                    assetsById.get(assetId)?.animation?.frameCount ??
                    NO_ANIMATION_FRAMES,
            },
        ];
    });
};
