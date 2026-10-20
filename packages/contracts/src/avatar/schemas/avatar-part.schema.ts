import { z } from "zod/v4";
import { MAX_LIBRARY_KEY_LENGTH } from "../../assets/consts/library";
import {
    AVATAR_COLOR_KEY_MAX_LENGTH,
    AVATAR_COLOR_PATTERN,
} from "../consts/color";
import { AVATAR_SLOTS } from "../enums/slots";
import { AvatarErrorMessages as Messages } from "./consts/error-messages";

const MAX_AVATAR_PART_NAME_LENGTH = 255;
const MAX_AVATAR_PART_SEARCH_LENGTH = 100;

const slot = z.enum(AVATAR_SLOTS, { error: Messages.slot.invalid });

const key = z
    .string({ error: Messages.key.invalid })
    .min(1, { error: Messages.key.invalid })
    .max(MAX_LIBRARY_KEY_LENGTH, { error: Messages.key.invalid });

const name = z
    .string({ error: Messages.name.invalid })
    .trim()
    .min(1, { error: Messages.name.invalid })
    .max(MAX_AVATAR_PART_NAME_LENGTH, { error: Messages.name.invalid });

const colorKey = z
    .string({ error: Messages.color.key.invalid })
    .trim()
    .min(1, { error: Messages.color.key.invalid })
    .max(AVATAR_COLOR_KEY_MAX_LENGTH, { error: Messages.color.key.invalid });

const colorHex = z
    .string({ error: Messages.color.hex.invalid })
    .regex(AVATAR_COLOR_PATTERN, { error: Messages.color.hex.invalid });

// One row of the library: a base part or one of its color variations. The
// color is both set or both null. The dates are ISO strings.
export const AvatarPartRowSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    slot,
    // Null for a base part, the id of the base for a variation.
    basePartId: z.string().nullable(),
    colorKey: z.string().nullable(),
    colorHex: z.string().nullable(),
    // `/files/:id` of the sheet.
    url: z.string(),
    // `/files/:id` of the thumbnail shown in the editor list.
    previewUrl: z.string(),
    createdAt: z.string(),
});

// A part as the admin page sees it: the base row and, in `variations`, every
// row of the family, the base first.
export const AvatarPartSchema = AvatarPartRowSchema.extend({
    variations: z.array(AvatarPartRowSchema),
});

// `data` part of `POST /library/avatar-parts`. The server derives the key from
// the name when it is missing. The color is both set or both missing. The
// sheets come in their own parts.
export const CreateAvatarPartDataSchema = z
    .object({
        key: key.optional(),
        name,
        slot,
        colorKey: colorKey.optional(),
        colorHex: colorHex.optional(),
    })
    .refine(
        (data) =>
            (data.colorKey === undefined) === (data.colorHex === undefined),
        {
            error: Messages.color.pair.invalid,
        }
    );

// `data` part of `POST /library/avatar-parts/:partId/variations`. The name,
// the slot and the base come from the base part, and the key is derived.
export const CreateAvatarVariationDataSchema = z.object({
    colorKey,
    colorHex,
});

// Body of `PATCH /library/avatar-parts/:partId`. The slot and the key never
// change, and the sheets have their own routes. The color is changed as a
// pair.
export const UpdateAvatarPartSchema = z
    .object({
        name: name.optional(),
        colorKey: colorKey.optional(),
        colorHex: colorHex.optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        error: Messages.update.empty,
    })
    .refine(
        (body) =>
            (body.colorKey === undefined) === (body.colorHex === undefined),
        {
            error: Messages.color.pair.invalid,
        }
    );

// Query string of `GET /library/avatar-parts`.
export const AvatarPartListQuerySchema = z.object({
    slot: slot.optional(),
    search: z
        .string({ error: Messages.query.search.invalid })
        .trim()
        .max(MAX_AVATAR_PART_SEARCH_LENGTH, {
            error: Messages.query.search.invalid,
        })
        .optional(),
});

export type AvatarPartRow = z.infer<typeof AvatarPartRowSchema>;
export type AvatarPart = z.infer<typeof AvatarPartSchema>;
export type CreateAvatarPartData = z.infer<typeof CreateAvatarPartDataSchema>;
export type CreateAvatarVariationData = z.infer<
    typeof CreateAvatarVariationDataSchema
>;
export type UpdateAvatarPartData = z.infer<typeof UpdateAvatarPartSchema>;
export type AvatarPartListQuery = z.infer<typeof AvatarPartListQuerySchema>;
