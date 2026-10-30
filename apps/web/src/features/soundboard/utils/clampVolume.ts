import {
    SOUNDBOARD_VOLUME_DEFAULT,
    SOUNDBOARD_VOLUME_MAX,
    SOUNDBOARD_VOLUME_MIN,
} from "@standin/contracts";
import { clamp } from "@/utils/clamp";

/** Keeps a gain inside the range the server accepts. NaN falls back to the default. */
export const clampVolume = (volume: number): number => {
    if (Number.isNaN(volume)) return SOUNDBOARD_VOLUME_DEFAULT;
    return clamp(volume, SOUNDBOARD_VOLUME_MIN, SOUNDBOARD_VOLUME_MAX);
};
