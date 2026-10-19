import { z } from "zod/v4";
import { AVATAR_SLOTS } from "../enums/slots";
import { AvatarErrorMessages as Messages } from "./consts/error-messages";

const slot = z.enum(AVATAR_SLOTS, { error: Messages.slot.invalid });

export const AvatarConfigPartSchema = z.object({
    slot,
    // A color is a variation, which is a part of its own, so choosing a color
    // means sending the id of that variation.
    partId: z
        .string({ error: Messages.config.partId.invalid })
        .min(1, { error: Messages.config.partId.invalid }),
});

// Body of `PUT /users/me/avatar`. At most one part per slot. An empty list
// means no parts, and a null or absent `baseId` means the default base.
// Whether each part and the base exist and fit is checked by the server.
export const AvatarConfigSchema = z.object({
    baseId: z
        .string({ error: Messages.base.id.invalid })
        .min(1, { error: Messages.base.id.invalid })
        .nullable()
        .optional(),
    parts: z
        .array(AvatarConfigPartSchema, { error: Messages.config.parts.invalid })
        .refine(
            (parts) =>
                new Set(parts.map((part) => part.slot)).size === parts.length,
            { error: Messages.config.duplicateSlot.invalid }
        ),
});

export type AvatarConfigPart = z.infer<typeof AvatarConfigPartSchema>;
export type AvatarConfig = z.infer<typeof AvatarConfigSchema>;
