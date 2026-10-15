import { z } from "zod/v4";
import {
    EraseOpSchema,
    LayerNameSchema,
    PaintOpSchema,
    RemoveZoneOpSchema,
    SetBackgroundOpSchema,
} from "../../layout/ops.schema";
import { MAX_OBJECT_OFFSET } from "../../consts/constants";
import { MAX_CELLS_PER_OP, ZONE_AREA_MIN_TILES } from "../consts/limits";
import { EditorOpErrorMessages as Messages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

const offset = (message: string) =>
    int(message)
        .min(-MAX_OBJECT_OFFSET, { error: message })
        .max(MAX_OBJECT_OFFSET, { error: message })
        .optional();

const ZoneRectSchema = z.object(
    {
        x: int(Messages.zone.rect.invalid),
        y: int(Messages.zone.rect.invalid),
        w: int(Messages.zone.rect.invalid).min(1, {
            error: Messages.zone.rect.invalid,
        }),
        h: int(Messages.zone.rect.invalid).min(1, {
            error: Messages.zone.rect.invalid,
        }),
    },
    { error: Messages.zone.rect.invalid }
);

export const ZoneInputSchema = z
    .object(
        {
            id: int(Messages.zone.id.invalid).optional(),
            kind: z.enum(["spawn", "area"], {
                error: Messages.zone.kind.invalid,
            }),
            rect: ZoneRectSchema,
            label: z.string({ error: Messages.zone.label.invalid }).optional(),
        },
        { error: Messages.zone.invalid }
    )
    .superRefine((zone, ctx) => {
        if (zone.kind !== "area") return;

        const label = zone.label?.trim() ?? "";
        if (label.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["label"],
                message: Messages.zone.label.required,
            });
        }

        const { w, h } = zone.rect;
        if (w < ZONE_AREA_MIN_TILES || h < ZONE_AREA_MIN_TILES) {
            ctx.addIssue({
                code: "custom",
                path: ["rect"],
                message: Messages.zone.size.min,
            });
        }
    });

const cellsLimit = { error: Messages.cells.max };

const PaintEditorOpSchema = PaintOpSchema.extend({
    cells: PaintOpSchema.shape.cells.max(MAX_CELLS_PER_OP, cellsLimit),
});

const PaintTilesItemSchema = z.object({
    tilesetId: PaintOpSchema.shape.tilesetId,
    tileIndex: PaintOpSchema.shape.tileIndex,
    cells: PaintOpSchema.shape.cells,
});

const PaintTilesEditorOpSchema = z
    .object({
        type: z.literal("paint_tiles"),
        layer: LayerNameSchema,
        tiles: z
            .array(PaintTilesItemSchema, { error: Messages.tiles.invalid })
            .min(1, { error: Messages.tiles.empty }),
    })
    .superRefine((op, ctx) => {
        const total = op.tiles.reduce(
            (sum, item) => sum + item.cells.length,
            0
        );
        if (total > MAX_CELLS_PER_OP) {
            ctx.addIssue({
                code: "custom",
                path: ["tiles"],
                message: Messages.tiles.max,
            });
        }
    });

const EraseEditorOpSchema = EraseOpSchema.extend({
    cells: EraseOpSchema.shape.cells.max(MAX_CELLS_PER_OP, cellsLimit),
});

const SetEditorZoneOpSchema = z.object({
    type: z.literal("set_zone"),
    zone: ZoneInputSchema,
});

const parentId = z
    .string({ error: Messages.parentId.invalid })
    .min(1, { error: Messages.parentId.invalid })
    .nullish();

const PlaceAssetOpSchema = z.object({
    type: z.literal("place_asset"),
    tempId: z
        .string({ error: Messages.tempId.invalid })
        .min(1, { error: Messages.tempId.invalid }),
    assetId: z
        .string({ error: Messages.assetId.invalid })
        .min(1, { error: Messages.assetId.invalid }),
    tileX: int(Messages.tile.invalid),
    tileY: int(Messages.tile.invalid),
    offsetX: offset(Messages.offset.invalid),
    offsetY: offset(Messages.offset.invalid),
    parentId,
});

const MoveAssetOpSchema = z.object({
    type: z.literal("move_asset"),
    id: z.string({ error: Messages.id.invalid }).min(1, {
        error: Messages.id.invalid,
    }),
    tileX: int(Messages.tile.invalid),
    tileY: int(Messages.tile.invalid),
    offsetX: offset(Messages.offset.invalid),
    offsetY: offset(Messages.offset.invalid),
    parentId,
});

const ReplaceAssetOpSchema = z.object({
    type: z.literal("replace_asset"),
    id: z.string({ error: Messages.id.invalid }).min(1, {
        error: Messages.id.invalid,
    }),
    assetId: z
        .string({ error: Messages.assetId.invalid })
        .min(1, { error: Messages.assetId.invalid }),
});

const RemoveAssetOpSchema = z.object({
    type: z.literal("remove_asset"),
    id: z.string({ error: Messages.id.invalid }).min(1, {
        error: Messages.id.invalid,
    }),
    releaseDesk: z.boolean({ error: Messages.releaseDesk.invalid }).optional(),
});

export const EditorOpSchema = z.discriminatedUnion(
    "type",
    [
        PaintEditorOpSchema,
        PaintTilesEditorOpSchema,
        EraseEditorOpSchema,
        SetEditorZoneOpSchema,
        RemoveZoneOpSchema,
        SetBackgroundOpSchema,
        PlaceAssetOpSchema,
        MoveAssetOpSchema,
        ReplaceAssetOpSchema,
        RemoveAssetOpSchema,
    ],
    { error: Messages.op.invalid }
);

export type EditorOp = z.infer<typeof EditorOpSchema>;
export type ZoneInput = z.infer<typeof ZoneInputSchema>;
