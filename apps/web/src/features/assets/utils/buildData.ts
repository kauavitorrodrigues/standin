import type { CreateAssetData } from "@standin/contracts";
import type { CreateAssetFormValues } from "../types/createForm";
import { getEffectiveCategory } from "./getEffectiveCategory";

const INFINITE_REPEAT = -1;

export const toRepeat = (values: {
    loopForever: boolean;
    repeatCount: number | undefined;
}) => {
    if (values.loopForever) return INFINITE_REPEAT;
    return values.repeatCount ?? 0;
};

// The color of the asset: the key and the hex it was given, none when it was
// left without one.
const buildColor = (
    values: CreateAssetFormValues
): CreateAssetData["color"] => {
    if (values.colorKey.trim() === "") return null;
    return { key: values.colorKey.trim(), hex: values.colorHex.trim() };
};

// How the strip plays: its frames, how long each one stays and how many times
// it repeats. A static asset has none.
const buildAnimation = (
    values: CreateAssetFormValues
): CreateAssetData["animation"] => {
    if (!values.isAnimated) return null;
    return {
        frameCount: values.frameCount ?? 0,
        frameDurationMs: values.frameDurationMs ?? 0,
        repeat: toRepeat(values),
    };
};

/**
 * The `data` part of `POST /library/assets`. The key is left to the server,
 * and no category means the default of the type.
 */
export const buildAssetData = (
    values: CreateAssetFormValues
): CreateAssetData => {
    const category = getEffectiveCategory(values);

    return {
        name: values.name.trim(),
        type: values.type,
        ...(category ? { category } : {}),
        placement: values.placement,
        solid: values.solid,
        footprint: {
            w: values.footprintW ?? 1,
            h: values.footprintH ?? 1,
            offsetX: values.footprintOffsetX ?? 0,
        },
        color: buildColor(values),
        animation: buildAnimation(values),
    };
};
