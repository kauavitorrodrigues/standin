import { z } from "zod/v4";
import { LAYOUT_LAYER_NAMES } from "../schemas/layout.schema";
import { LayoutOpErrorMessages as Messages } from "../schemas/consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

export const LayerNameSchema = z.enum(
    Object.values(LAYOUT_LAYER_NAMES) as [string, ...string[]],
    {
        error: Messages.layer.invalid,
    }
);

export const CellSchema = z.tuple(
    [int(Messages.cell.invalid), int(Messages.cell.invalid)],
    { error: Messages.cell.invalid }
);

export const ZoneSchema = z.object({
    id: int(Messages.zoneId.invalid).optional(),
    kind: z.string({ error: Messages.zone.kind.invalid }),
    name: z.string({ error: Messages.zone.label.invalid }).optional(),
    x: z.number({ error: Messages.zone.position.invalid }),
    y: z.number({ error: Messages.zone.position.invalid }),
    width: z.number({ error: Messages.zone.size.invalid }),
    height: z.number({ error: Messages.zone.size.invalid }),
    rotation: z.number({ error: Messages.zone.rotation.invalid }).optional(),
    polygon: z
        .array(
            z.object({
                x: z.number({ error: Messages.zone.polygon.invalid }),
                y: z.number({ error: Messages.zone.polygon.invalid }),
            }),
            { error: Messages.zone.polygon.invalid }
        )
        .optional(),
    label: z.string({ error: Messages.zone.label.invalid }).optional(),
    key: z.string({ error: Messages.zone.key.invalid }).optional(),
    targetX: z.number({ error: Messages.zone.target.invalid }).optional(),
    targetY: z.number({ error: Messages.zone.target.invalid }).optional(),
});

export const PaintOpSchema = z.object({
    type: z.literal("paint"),
    layer: LayerNameSchema,
    tilesetId: z
        .string({ error: Messages.tilesetId.invalid })
        .min(1, { error: Messages.tilesetId.invalid }),
    tileIndex: int(Messages.tileIndex.invalid).min(0, {
        error: Messages.tileIndex.invalid,
    }),
    cells: z.array(CellSchema, { error: Messages.cells.invalid }),
});

export const EraseOpSchema = z.object({
    type: z.literal("erase"),
    layer: LayerNameSchema,
    cells: z.array(CellSchema, { error: Messages.cells.invalid }),
});

export const SetZoneOpSchema = z.object({
    type: z.literal("set_zone"),
    zone: ZoneSchema,
});

export const RemoveZoneOpSchema = z.object({
    type: z.literal("remove_zone"),
    zoneId: int(Messages.zoneId.invalid),
});

export const SetBackgroundOpSchema = z.object({
    type: z.literal("set_background"),
    color: z
        .string({ error: Messages.color.invalid })
        .regex(/^#[0-9a-fA-F]{6}$/, { error: Messages.color.invalid }),
});

export const LayoutOpSchema = z.discriminatedUnion(
    "type",
    [
        PaintOpSchema,
        EraseOpSchema,
        SetZoneOpSchema,
        RemoveZoneOpSchema,
        SetBackgroundOpSchema,
    ],
    { error: Messages.op.invalid }
);

export type LayoutOp = z.infer<typeof LayoutOpSchema>;
export type LayerName = z.infer<typeof LayerNameSchema>;
