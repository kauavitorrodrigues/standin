import type { AssetDefinition } from "@standin/contracts";
import type { EditAssetFormValues } from "../types/editForm";
import { NO_VALUE } from "../consts/formFields";

const INFINITE_REPEAT = -1;

export const toEditAssetValues = (
    asset: AssetDefinition & { promptText: string | null }
): EditAssetFormValues => ({
    name: asset.name,
    category: asset.category,
    promptText: asset.promptText ?? NO_VALUE,
    placement: asset.placement,
    solid: asset.solid,
    surfaceHeightPx: asset.surfaceHeightPx,
    frameDurationMs: asset.animation?.frameDurationMs,
    loopForever: asset.animation?.repeat === INFINITE_REPEAT,
    repeatCount:
        asset.animation && asset.animation.repeat !== INFINITE_REPEAT
            ? asset.animation.repeat
            : 0,
});
