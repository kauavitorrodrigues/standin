import {
    SOUNDBOARD_VOLUME_DEFAULT,
    SoundboardClipIconSchema,
    SoundboardClipVolumeSchema,
    SoundboardIconInvalidError,
    SoundboardVolumeInvalidError,
} from "@standin/contracts";

const isBlank = (value: unknown): boolean =>
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");

/** No icon (absent, null or empty) is allowed. Anything else must be one. */
export const parseIcon = (value: unknown): string | null => {
    if (isBlank(value)) return null;

    const parsed = SoundboardClipIconSchema.safeParse(value);
    if (!parsed.success) throw new SoundboardIconInvalidError();
    return parsed.data;
};

// A form sends the volume as text ("0.6"), a JSON body as a number.
const toNumber = (value: unknown): unknown =>
    typeof value === "string" ? Number(value) : value;

/** `fallback` when the volume is absent; otherwise it must be within 0 and 1. */
export const parseVolume = (
    value: unknown,
    fallback: number = SOUNDBOARD_VOLUME_DEFAULT
): number => {
    if (isBlank(value)) return fallback;

    const parsed = SoundboardClipVolumeSchema.safeParse(toNumber(value));
    if (!parsed.success) throw new SoundboardVolumeInvalidError();
    return parsed.data;
};
