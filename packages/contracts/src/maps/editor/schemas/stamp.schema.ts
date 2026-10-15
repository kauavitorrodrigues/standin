import { z } from "zod/v4";
import { AREA_NAME_MAX } from "../../../areas/consts/limits";
import { MAX_OBJECT_OFFSET } from "../../consts/constants";
import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
    STAMP_VERSION,
} from "../consts/limits";
import { StampErrorMessages as Messages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

const offset = int(Messages.offset.invalid)
    .min(-MAX_OBJECT_OFFSET, { error: Messages.offset.invalid })
    .max(MAX_OBJECT_OFFSET, { error: Messages.offset.invalid });

const StampObjectSchema = z.object(
    {
        assetId: z.string({ error: Messages.assetId.invalid }).min(1),
        dx: int(Messages.position.invalid).min(0, {
            error: Messages.position.invalid,
        }),
        dy: int(Messages.position.invalid).min(0, {
            error: Messages.position.invalid,
        }),
        offsetX: offset,
        offsetY: offset,
        parentIndex: int(Messages.parentIndex.invalid)
            .min(0, { error: Messages.parentIndex.invalid })
            .nullable(),
    },
    { error: Messages.object.invalid }
);

const StampPaletteEntrySchema = z.object(
    {
        tilesetId: z.string({ error: Messages.tilesetId.invalid }).min(1),
        tileIndex: int(Messages.tileIndex.invalid).min(0, {
            error: Messages.tileIndex.invalid,
        }),
    },
    { error: Messages.palette.invalid }
);

const LAYER_NAMES = Object.values(LAYOUT_LAYER_NAMES) as [string, ...string[]];

// Structure only. The rules that need the library (tile_meta, categories,
// placement) live in validateStamp.
export const StampSchema = z
    .object(
        {
            version: z.literal(STAMP_VERSION, { error: Messages.version }),
            width: int(Messages.size.invalid)
                .min(STAMP_MIN_SIZE, { error: Messages.size.tooSmall })
                .max(STAMP_MAX_WIDTH, { error: Messages.size.tooLarge }),
            height: int(Messages.size.invalid)
                .min(STAMP_MIN_SIZE, { error: Messages.size.tooSmall })
                .max(STAMP_MAX_HEIGHT, { error: Messages.size.tooLarge }),
            palette: z.array(StampPaletteEntrySchema, {
                error: Messages.palette.invalid,
            }),
            layers: z.partialRecord(
                z.enum(LAYER_NAMES, { error: Messages.layers.invalid }),
                z.array(int(Messages.layers.invalid).min(0), {
                    error: Messages.layers.invalid,
                }),
                { error: Messages.layers.invalid }
            ),
            objects: z
                .array(StampObjectSchema, { error: Messages.object.invalid })
                .max(STAMP_MAX_OBJECTS, { error: Messages.object.max }),
            zone: z
                .object(
                    {
                        label: z
                            .string({ error: Messages.zone.invalid })
                            .trim()
                            .min(1, { error: Messages.zone.invalid })
                            .max(AREA_NAME_MAX, {
                                error: Messages.zone.invalid,
                            }),
                    },
                    { error: Messages.zone.invalid }
                )
                .nullable(),
        },
        { error: Messages.invalid }
    )
    .superRefine((stamp, ctx) => {
        const cells = stamp.width * stamp.height;

        for (const [layer, data] of Object.entries(stamp.layers)) {
            if (!data) continue;

            if (data.length !== cells) {
                ctx.addIssue({
                    code: "custom",
                    path: ["layers", layer],
                    message: Messages.layers.length,
                });
            }
            if (data.some((value) => value > stamp.palette.length)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["layers", layer],
                    message: Messages.layers.outOfRange,
                });
            }
        }

        const seen = new Set<string>();
        for (const [index, entry] of stamp.palette.entries()) {
            const key = `${entry.tilesetId}:${entry.tileIndex}`;
            if (seen.has(key)) {
                ctx.addIssue({
                    code: "custom",
                    path: ["palette", index],
                    message: Messages.palette.duplicated,
                });
            }
            seen.add(key);
        }

        for (const [index, object] of stamp.objects.entries()) {
            if (object.parentIndex !== null && object.parentIndex >= index) {
                ctx.addIssue({
                    code: "custom",
                    path: ["objects", index, "parentIndex"],
                    message: Messages.parentIndex.order,
                });
            }
        }
    });
