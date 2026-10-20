import {
    SitActionParamsSchema,
    TILE_SIZE,
    ASSET_ACTIONS,
    type AssetDefinition,
    type PlacedAsset,
    type PlayerDirection,
} from "@standin/contracts";
import { SEAT_FACING_DIRECTIONS } from "@/features/game/consts/seat";
import {
    resolvePlacedLayout,
    type PlacedRect,
} from "@/features/game/utils/placed";

export type SeatSpot = {
    // Where the avatar sits, in px, and where it looks once seated.
    x: number;
    y: number;
    direction: PlayerDirection;
    // The depth of the piece the seat is on, so the avatar can draw over it.
    depth: number;
};

// A piece with seats: its footprint and the spots an avatar can be sat at.
export type SeatArea = {
    // The footprint of the piece, which the avatar pushes against.
    footprint: PlacedRect;
    seats: SeatSpot[];
};

type PlacedRef = Pick<
    PlacedAsset,
    "id" | "assetId" | "tileX" | "tileY" | "offsetX" | "offsetY" | "parentId"
>;
type AssetRef = Pick<
    AssetDefinition,
    | "id"
    | "type"
    | "footprint"
    | "placement"
    | "surfaceHeightPx"
    | "solid"
    | "sprite"
    | "action"
    | "actionParams"
>;

const buildFootprint = (placed: PlacedRef, asset: AssetRef): PlacedRect => {
    const { w, h } = asset.footprint;
    return {
        x: placed.tileX * TILE_SIZE + placed.offsetX,
        y: (placed.tileY - h + 1) * TILE_SIZE + placed.offsetY,
        width: w * TILE_SIZE,
        height: h * TILE_SIZE,
    };
};

/**
 * The pieces that have seats, with their footprint and their seat spots. The seats are marked in the
 * image of the piece, counted from the left and the bottom of its first frame,
 * so they follow the sprite wherever the layout draws it. Pieces with no sit
 * action, or with params that do not read as seats, have no area.
 */
export const buildSeatAreas = (
    placed: readonly PlacedRef[],
    assetsById: ReadonlyMap<string, AssetRef>,
    mapHeightPx: number
): SeatArea[] => {
    const placedById = new Map(placed.map((item) => [item.id, item]));
    const areas: SeatArea[] = [];

    for (const item of placed) {
        const asset = assetsById.get(item.assetId);
        if (!asset || asset.action !== ASSET_ACTIONS.SIT) continue;

        const params = SitActionParamsSchema.safeParse(asset.actionParams);
        const layout = resolvePlacedLayout(
            item,
            assetsById,
            placedById,
            mapHeightPx
        );
        if (!params.success || !layout) continue;

        areas.push({
            footprint: buildFootprint(item, asset),
            seats: params.data.seats.map((seat) => ({
                x: layout.x + seat.dx,
                y: layout.bottomY - seat.dy,
                direction: SEAT_FACING_DIRECTIONS[seat.facing],
                depth: layout.depth,
            })),
        });
    }

    return areas;
};
