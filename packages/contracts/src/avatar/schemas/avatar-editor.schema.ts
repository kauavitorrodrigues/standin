import { z } from "zod/v4";
import { AVATAR_PARTS_PAGE } from "../consts/limits";
import { AVATAR_SLOTS } from "../enums/slots";
import { AvatarErrorMessages as Messages } from "./consts/error-messages";

const slot = z.enum(AVATAR_SLOTS, { error: Messages.slot.invalid });

export const AvatarEditorCategorySchema = z.object({
    slot,
    name: z.string(),
    // `/files/:id` of the image shown beside the name.
    previewUrl: z.string().nullable(),
});

export const AvatarEditorBaseSchema = z.object({
    id: z.string(),
    name: z.string(),
    // `/files/:id` of the sprite sheet.
    url: z.string(),
    previewUrl: z.string().nullable(),
    isDefault: z.boolean(),
});

// What the person uses now. It includes parts deleted since, so the preview
// stays faithful, and the id of the family so the editor can mark the tile.
export const AvatarEditorCurrentPartSchema = z.object({
    slot,
    partId: z.string(),
    familyId: z.string(),
    url: z.string(),
});

// Response of `GET /avatar/editor`: what the editor needs to open, without any
// part list. The parts of a category come from `GET /avatar/categories/:slot/parts`.
export const AvatarEditorSchema = z.object({
    // Ordered by the order of the editor.
    categories: z.array(AvatarEditorCategorySchema),
    bases: z.array(AvatarEditorBaseSchema),
    current: z.object({
        // The base in use, null when the default is used.
        baseId: z.string().nullable(),
        parts: z.array(AvatarEditorCurrentPartSchema),
    }),
});

// Query string of `GET /avatar/categories/:slot/parts`.
export const AvatarCategoryPartsQuerySchema = z.object({
    cursor: z
        .string({ error: Messages.query.cursor.invalid })
        .min(1, { error: Messages.query.cursor.invalid })
        .optional(),
    limit: z.coerce
        .number({ error: Messages.query.limit.invalid })
        .int({ error: Messages.query.limit.invalid })
        .min(1, { error: Messages.query.limit.invalid })
        .max(AVATAR_PARTS_PAGE.max, { error: Messages.query.limit.invalid })
        .default(AVATAR_PARTS_PAGE.default),
});

// One color of a part in the editor. A part with no colors has one variation
// with the color fields null.
export const AvatarCategoryPartVariationSchema = z.object({
    id: z.string(),
    colorKey: z.string().nullable(),
    colorHex: z.string().nullable(),
    url: z.string(),
    previewUrl: z.string(),
});

export const AvatarCategoryPartItemSchema = z.object({
    // The id of the base part, the id of the family.
    id: z.string(),
    name: z.string(),
    previewUrl: z.string(),
    // Every active row of the family, the base first.
    variations: z.array(AvatarCategoryPartVariationSchema),
});

// Response of `GET /avatar/categories/:slot/parts`. `nextCursor` is opaque and
// null on the last page.
export const AvatarCategoryPartsPageSchema = z.object({
    items: z.array(AvatarCategoryPartItemSchema),
    nextCursor: z.string().nullable(),
});

export type AvatarEditorCategory = z.infer<typeof AvatarEditorCategorySchema>;
export type AvatarEditorBase = z.infer<typeof AvatarEditorBaseSchema>;
export type AvatarEditorCurrentPart = z.infer<
    typeof AvatarEditorCurrentPartSchema
>;
export type AvatarEditor = z.infer<typeof AvatarEditorSchema>;
export type AvatarCategoryPartsQuery = z.infer<
    typeof AvatarCategoryPartsQuerySchema
>;
export type AvatarCategoryPartVariation = z.infer<
    typeof AvatarCategoryPartVariationSchema
>;
export type AvatarCategoryPartItem = z.infer<
    typeof AvatarCategoryPartItemSchema
>;
export type AvatarCategoryPartsPage = z.infer<
    typeof AvatarCategoryPartsPageSchema
>;
