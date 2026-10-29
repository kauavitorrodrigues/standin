import { z } from "zod/v4";
import {
    MAP_SIZE_TIERS,
    STAMP_MAX_HEIGHT,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
} from "@standin/contracts";
import { DeskSchema, ObjectSchema, SpawnSchema } from "./object.schema";
import { TileRefSchema, WallStyleSchema } from "./parts.schema";
import { FloorSchema, RoomSchema, ZoneSchema } from "./room.schema";

const content = {
    name: z.string().min(1).optional(),
    style: z
        .strictObject({
            floor: TileRefSchema.optional(),
            walls: WallStyleSchema.optional(),
        })
        .optional()
        .describe("Defaults for the rooms that do not set their own."),
    floors: z.array(FloorSchema).optional(),
    rooms: z.array(RoomSchema).optional(),
    zones: z.array(ZoneSchema).optional(),
    objects: z.array(ObjectSchema).optional(),
    desks: z.array(DeskSchema).optional(),
};

export const MapSpecSchema = z.strictObject({
    kind: z.literal("map"),
    sizeTier: z.enum(MAP_SIZE_TIERS),
    ...content,
    spawns: z.array(SpawnSchema).optional(),
});

export const TemplateSpecSchema = z.strictObject({
    kind: z.literal("template"),
    sizeTier: z.enum(MAP_SIZE_TIERS),
    ...content,
    spawns: z.array(SpawnSchema).optional(),
});

export const AreaSpecSchema = z.strictObject({
    kind: z.literal("area"),
    size: z.strictObject({
        width: z.number().int().min(STAMP_MIN_SIZE).max(STAMP_MAX_WIDTH),
        height: z.number().int().min(STAMP_MIN_SIZE).max(STAMP_MAX_HEIGHT),
    }),
    ...content,
});

export const SpecSchema = z.discriminatedUnion(
    "kind",
    [MapSpecSchema, TemplateSpecSchema, AreaSpecSchema],
    { error: "kind must be map, template or area." }
);
