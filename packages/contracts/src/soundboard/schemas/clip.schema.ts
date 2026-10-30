import { z } from "zod/v4";
import {
    SOUNDBOARD_DEFAULT_PAGE_SIZE,
    SOUNDBOARD_MAX_PAGE_SIZE,
    SOUNDBOARD_NAME_MAX,
    SOUNDBOARD_VOLUME_MAX,
    SOUNDBOARD_VOLUME_MIN,
} from "../consts/limits";
import { isSingleEmoji } from "../utils/isSingleEmoji";
import { SOUNDBOARD_CLIP_SCOPES } from "../enums/clip-scope";
import { SoundboardErrorMessages as Messages } from "./error-messages";

export const SoundboardClipNameSchema = z
    .string({ error: Messages.name.invalid })
    .trim()
    .min(1, { error: Messages.name.invalid })
    .max(SOUNDBOARD_NAME_MAX, { error: Messages.name.invalid });

// The icon is optional: absent or null means none, an empty string from a
// form field too. Anything else must be exactly one emoji.
export const SoundboardClipIconSchema = z
    .string({ error: Messages.icon.invalid })
    .trim()
    .refine(isSingleEmoji, { error: Messages.icon.invalid });

// 0 is silent and 1 is the recorded level.
export const SoundboardClipVolumeSchema = z
    .number({ error: Messages.volume.invalid })
    .min(SOUNDBOARD_VOLUME_MIN, { error: Messages.volume.invalid })
    .max(SOUNDBOARD_VOLUME_MAX, { error: Messages.volume.invalid });

// The body of PATCH .../clips/:clipId: any of the three, so the uploader can
// turn a loud clip down later. A null icon clears it.
export const SoundboardUpdateBodySchema = z
    .object({
        name: SoundboardClipNameSchema.optional(),
        icon: SoundboardClipIconSchema.nullable().optional(),
        volume: SoundboardClipVolumeSchema.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
        error: Messages.name.invalid,
    });

// Query of GET .../clips. `scope` narrows to one section of the panel, so each
// section pages on its own.
export const SoundboardClipListQuerySchema = z.object({
    scope: z.enum(Object.values(SOUNDBOARD_CLIP_SCOPES)).optional(),
    search: z.string().trim().max(SOUNDBOARD_NAME_MAX).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(SOUNDBOARD_MAX_PAGE_SIZE)
        .default(SOUNDBOARD_DEFAULT_PAGE_SIZE),
});

export type SoundboardUpdateBody = z.infer<typeof SoundboardUpdateBodySchema>;
export type SoundboardClipListQuery = z.infer<
    typeof SoundboardClipListQuerySchema
>;
