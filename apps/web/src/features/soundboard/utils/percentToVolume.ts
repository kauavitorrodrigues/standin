import { SOUNDBOARD_VOLUME_PERCENT } from "../consts/volume";
import { clampVolume } from "./clampVolume";

export const percentToVolume = (percent: number): number =>
    clampVolume(Math.round(percent) / SOUNDBOARD_VOLUME_PERCENT);
