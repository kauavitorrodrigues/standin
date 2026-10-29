import { z } from "zod/v4";
import { coordinate, offset, reference } from "./parts.schema";

export const ObjectSchema = z.strictObject({
    asset: reference.describe("Key of the asset in the library."),
    x: coordinate.describe("Anchor column, the bottom left cell."),
    y: coordinate.describe("Anchor row, the bottom left cell."),
    offsetX: offset.optional(),
    offsetY: offset.optional(),
});

export const DeskSchema = z.strictObject({
    asset: reference.describe("Key of a DESK asset."),
    x: coordinate,
    y: coordinate,
    items: z
        .array(ObjectSchema)
        .optional()
        .describe("Assets that sit on the desk, such as a monitor."),
    chairs: z
        .array(ObjectSchema)
        .optional()
        .describe("CHAIR assets, placed where they should stand."),
});

export const SpawnSchema = z.strictObject({
    x: coordinate,
    y: coordinate,
    label: z.string().min(1).optional(),
});
