import { z } from "zod/v4";
import { DOOR_SIDES, ZONE_AREA_MIN_TILES } from "@standin/contracts";
import {
    TileRefSchema,
    WallStyleSchema,
    coordinate,
    length,
    reference,
} from "./parts.schema";

export const DoorSchema = z.strictObject({
    side: z.enum(DOOR_SIDES).describe("Wall of the room the door stands in."),
    door: reference.describe("Key of any variant of the door family."),
    offset: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe(
            "Cells from the first cell of the side. Left out, the door is centered."
        ),
});

export const RoomSchema = z.strictObject({
    key: reference.describe("Unique key of the room."),
    label: z.string().min(1),
    x: coordinate,
    y: coordinate,
    width: length(ZONE_AREA_MIN_TILES),
    height: length(ZONE_AREA_MIN_TILES),
    walls: WallStyleSchema.optional().describe(
        "Overrides style.walls for this room."
    ),
    floor: TileRefSchema.optional().describe(
        "Overrides style.floor for this room."
    ),
    doors: z.array(DoorSchema).optional(),
});

export const ZoneSchema = z.strictObject({
    label: z.string().min(1),
    x: coordinate,
    y: coordinate,
    width: length(ZONE_AREA_MIN_TILES),
    height: length(ZONE_AREA_MIN_TILES),
});

export const FloorSchema = z.strictObject({
    tileset: reference.describe("Tileset id or name."),
    tileIndex: z.number().int().min(0),
    from: z.strictObject({ x: coordinate, y: coordinate }),
    to: z.strictObject({ x: coordinate, y: coordinate }),
    layer: z.string().min(1).optional(),
});
