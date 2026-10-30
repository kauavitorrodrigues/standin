import { SOUNDBOARD_VOLUME_PERCENT } from "../consts/volume";
import { clampVolume } from "./clampVolume";

export const volumeToPercent = (volume: number): number =>
    Math.round(clampVolume(volume) * SOUNDBOARD_VOLUME_PERCENT);
