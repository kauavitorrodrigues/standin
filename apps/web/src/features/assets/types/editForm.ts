import type { AssetDefinition } from "@standin/contracts";

export type EditAssetFormValues = {
    name: string;
    category: AssetDefinition["category"];
    promptText: string;
    placement: AssetDefinition["placement"];
    solid: boolean;
    surfaceHeightPx: number | undefined;
    // Only for animated assets. The frame count never changes.
    frameDurationMs: number | undefined;
    loopForever: boolean;
    repeatCount: number | undefined;
};

export type ReplaceImageFormValues = { image: File[] };
