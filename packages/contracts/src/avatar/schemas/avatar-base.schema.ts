import { z } from "zod/v4";
import { MAX_LIBRARY_KEY_LENGTH } from "../../assets/consts/library";
import { AVATAR_BASE_KINDS } from "../enums/base-kinds";
import { AvatarErrorMessages as Messages } from "./consts/error-messages";

const MAX_AVATAR_BASE_NAME_LENGTH = 255;

const key = z
    .string({ error: Messages.key.invalid })
    .min(1, { error: Messages.key.invalid })
    .max(MAX_LIBRARY_KEY_LENGTH, { error: Messages.key.invalid });

const kind = z.enum(AVATAR_BASE_KINDS, { error: Messages.base.kind.invalid });

const name = z
    .string({ error: Messages.name.invalid })
    .trim()
    .min(1, { error: Messages.name.invalid })
    .max(MAX_AVATAR_BASE_NAME_LENGTH, { error: Messages.name.invalid });

// A base (the blank avatar) as the admin page sees it. The dates are ISO
// strings.
export const AvatarBaseSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    kind,
    isDefault: z.boolean(),
    // `/files/:id` of the sprite sheet.
    url: z.string(),
    // `/files/:id` of the image shown in lists.
    previewUrl: z.string().nullable(),
    createdAt: z.string(),
    deletedAt: z.string().nullable(),
});

// The bases of one kind, the default first and the rest by name.
export const AvatarBaseGroupSchema = z.object({
    kind,
    bases: z.array(AvatarBaseSchema),
});

// Response of `GET /library/avatar-bases`: one group for each kind, always
// both, the bodies first and then the mannequins. A kind with no base comes
// with an empty list.
export const AvatarBaseListSchema = z.object({
    groups: z.array(AvatarBaseGroupSchema),
});

// `data` part of `POST /library/avatar-bases`. The server derives the key from
// the name when it is missing. The sheet and the preview come in their own
// parts. Creating the first base of a kind makes it the default of that kind.
export const CreateAvatarBaseDataSchema = z.object({
    key: key.optional(),
    name,
    kind: kind.default(AVATAR_BASE_KINDS.BODY),
    isDefault: z
        .boolean({ error: Messages.base.isDefault.invalid })
        .default(false),
});

// Body of `PATCH /library/avatar-bases/:baseId`. The key and the kind never
// change and the images have their own routes. `isDefault` can only be turned
// on, which turns it off in the previous default of the same kind, so there is
// always one.
export const UpdateAvatarBaseSchema = z
    .object({
        name: name.optional(),
        isDefault: z
            .literal(true, { error: Messages.base.isDefault.invalid })
            .optional(),
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
        error: Messages.update.empty,
    });

export type AvatarBase = z.infer<typeof AvatarBaseSchema>;
export type AvatarBaseGroup = z.infer<typeof AvatarBaseGroupSchema>;
export type AvatarBaseList = z.infer<typeof AvatarBaseListSchema>;
export type CreateAvatarBaseData = z.infer<typeof CreateAvatarBaseDataSchema>;
export type UpdateAvatarBaseData = z.infer<typeof UpdateAvatarBaseSchema>;
