import { z } from "zod/v4";
import { MAX_LIBRARY_KEY_LENGTH } from "../consts/library";
import { ASSET_ACTIONS } from "../enums/asset-action";
import { ASSET_PLACEMENTS } from "../enums/asset-placement";
import { ASSET_ROTATIONS } from "../enums/asset-rotation";
import { ASSET_TYPES } from "../enums/asset-type";
import { assetAnimationSchema } from "./asset-animation.schema";
import { assetColorSchema } from "./asset-color.schema";
import { LibraryDataErrorMessages as Messages } from "./consts/error-messages";

const int = (message: string) =>
    z.number({ error: message }).int({ error: message });

const key = z
    .string({ error: Messages.key.invalid })
    .min(1, { error: Messages.key.invalid })
    .max(MAX_LIBRARY_KEY_LENGTH, { error: Messages.key.invalid });

const name = z
    .string({ error: Messages.name.invalid })
    .min(1, { error: Messages.name.invalid });

const organizationId = z
    .string({ error: Messages.organizationId.invalid })
    .min(1, { error: Messages.organizationId.invalid });

export const LibraryFootprintSchema = z.object(
    {
        w: int(Messages.footprint.invalid).positive({
            error: Messages.footprint.invalid,
        }),
        h: int(Messages.footprint.invalid).positive({
            error: Messages.footprint.invalid,
        }),
        offsetX: int(Messages.footprint.invalid)
            .min(0, { error: Messages.footprint.invalid })
            .optional(),
    },
    { error: Messages.footprint.invalid }
);

export const LibraryActionParamsSchema = z.record(z.string(), z.unknown(), {
    error: Messages.update.invalid,
});

// `data` part of `POST /library/assets`. The server derives the key from the
// name when it is missing, and the category from the type when it has a
// default. The category is checked against the enum by the service.
export const CreateAssetDataSchema = z.object({
    key: key.optional(),
    name,
    type: z.enum(ASSET_TYPES, { error: Messages.update.invalid }),
    category: z.string({ error: Messages.update.invalid }).optional(),
    placement: z
        .enum(ASSET_PLACEMENTS, { error: Messages.update.invalid })
        .optional(),
    solid: z.boolean({ error: Messages.update.invalid }).optional(),
    surfaceHeightPx: int(Messages.update.invalid)
        .min(0, { error: Messages.update.invalid })
        .optional(),
    footprint: LibraryFootprintSchema,
    action: z
        .enum(ASSET_ACTIONS, { error: Messages.update.invalid })
        .nullable()
        .optional(),
    actionParams: LibraryActionParamsSchema.nullable().optional(),
    promptText: z
        .string({ error: Messages.update.invalid })
        .nullable()
        .optional(),
    rotation: z
        .enum(ASSET_ROTATIONS, { error: Messages.update.invalid })
        .nullable()
        .optional(),
    color: assetColorSchema.nullable().optional(),
    animation: assetAnimationSchema.nullable().optional(),
    organizationId: organizationId.optional(),
});

// `data` part of `POST /library/assets/:baseId/variants`. A new color on an
// existing rotation sends only `color` (and `key`). A new rotation also sends
// `footprint`, and `actionParams` when the base has an action. Any other key is
// an error.
export const CreateVariantDataSchema = z
    .object({
        key: key.optional(),
        color: assetColorSchema.optional(),
        rotation: z
            .enum(ASSET_ROTATIONS, { error: Messages.variant.invalid })
            .optional(),
        footprint: LibraryFootprintSchema.optional(),
        actionParams: LibraryActionParamsSchema.optional(),
    })
    .strict();

// Body of `PATCH /library/assets/:id`. `key`, `type` and `frameCount` never
// change, but `frameCount` is accepted here so the service can answer with
// ANIMATION_IMMUTABLE instead of a schema error. What comes from the PNG (the
// footprint, which is bound to the frame size) is replaced with the image, and
// the color has its own route, `PATCH /library/assets/:id/color`. Any of them
// here is a schema error.
export const UpdateLibraryAssetSchema = z
    .object({
        name: name.optional(),
        // Checked against the enum by the service (CATEGORY_INVALID, 422).
        category: z.string({ error: Messages.update.invalid }).optional(),
        rotation: z
            .enum(ASSET_ROTATIONS, { error: Messages.update.invalid })
            .nullable()
            .optional(),
        placement: z
            .enum(ASSET_PLACEMENTS, { error: Messages.update.invalid })
            .optional(),
        surfaceHeightPx: int(Messages.update.invalid)
            .min(0, { error: Messages.update.invalid })
            .optional(),
        solid: z.boolean({ error: Messages.update.invalid }).optional(),
        action: z
            .enum(ASSET_ACTIONS, { error: Messages.update.invalid })
            .nullable()
            .optional(),
        actionParams: LibraryActionParamsSchema.nullable().optional(),
        promptText: z
            .string({ error: Messages.update.invalid })
            .nullable()
            .optional(),
        animation: assetAnimationSchema.partial().optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        error: Messages.update.empty,
    });

// Body of `PATCH /library/assets/:id/color`. The color is renamed on every row
// of the family that shares the color of `:id`.
export const UpdateLibraryColorSchema = z
    .object({ color: assetColorSchema })
    .strict();

// Query of `DELETE /library/assets/:id`.
export const DeleteAssetQuerySchema = z.object({
    family: z
        .enum(["true", "false"], { error: Messages.family.invalid })
        .optional()
        .transform((value) => value === "true"),
});

export const SetAssetPartsSchema = z.object({
    parts: z.array(
        z.object({
            partAssetId: z.string({ error: Messages.parts.invalid }).min(1),
            offsetX: int(Messages.parts.invalid),
            offsetY: int(Messages.parts.invalid),
        }),
        { error: Messages.parts.invalid }
    ),
});

export type CreateAssetData = z.infer<typeof CreateAssetDataSchema>;
export type CreateVariantData = z.infer<typeof CreateVariantDataSchema>;
export type UpdateLibraryAssetSchemaType = z.infer<
    typeof UpdateLibraryAssetSchema
>;
export type UpdateLibraryColorSchemaType = z.infer<
    typeof UpdateLibraryColorSchema
>;
export type DeleteAssetQuery = z.infer<typeof DeleteAssetQuerySchema>;
export type SetAssetPartsSchemaType = z.infer<typeof SetAssetPartsSchema>;
