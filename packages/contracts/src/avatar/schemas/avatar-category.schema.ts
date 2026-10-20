import { z } from "zod/v4";
import { AVATAR_SLOTS } from "../enums/slots";
import { AvatarErrorMessages as Messages } from "./consts/error-messages";

const MAX_AVATAR_CATEGORY_NAME_LENGTH = 255;

const slot = z.enum(AVATAR_SLOTS, { error: Messages.slot.invalid });

const name = z
    .string({ error: Messages.name.invalid })
    .trim()
    .min(1, { error: Messages.name.invalid })
    .max(MAX_AVATAR_CATEGORY_NAME_LENGTH, { error: Messages.name.invalid });

const sortOrder = z
    .number({ error: Messages.category.sortOrder.invalid })
    .int({ error: Messages.category.sortOrder.invalid })
    .min(0, { error: Messages.category.sortOrder.invalid });

// A category as the admin page sees it.
export const AvatarCategorySchema = z.object({
    slot,
    name: z.string(),
    sortOrder: z.number(),
    // `/files/:id` of the image shown beside the name.
    previewUrl: z.string().nullable(),
});

// Response of `GET /library/avatar-categories`, ordered by `sortOrder`.
export const AvatarCategoryListSchema = z.object({
    categories: z.array(AvatarCategorySchema),
});

// Params of the routes of one category.
export const AvatarCategoryParamsSchema = z.object({ slot });

// Body of `PATCH /library/avatar-categories/:slot`. The slot never changes
// and the image has its own route.
export const UpdateAvatarCategorySchema = z
    .object({
        name: name.optional(),
        sortOrder: sortOrder.optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        error: Messages.update.empty,
    });

export type AvatarCategory = z.infer<typeof AvatarCategorySchema>;
export type AvatarCategoryList = z.infer<typeof AvatarCategoryListSchema>;
export type AvatarCategoryParams = z.infer<typeof AvatarCategoryParamsSchema>;
export type UpdateAvatarCategoryData = z.infer<
    typeof UpdateAvatarCategorySchema
>;
