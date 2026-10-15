import type { AssetDefinition } from "@standin/contracts";

export type CreateAssetFormValues = {
    image: File[];
    name: string;
    type: AssetDefinition["type"];
    // Empty means the default category of the type.
    category: string;
    placement: AssetDefinition["placement"];
    solid: boolean;
    // The part of the image that is the piece, in px. Zero width and height
    // mean no crop, the whole image is the piece.
    cropX: number;
    cropY: number;
    cropW: number;
    cropH: number;
    footprintW: number | undefined;
    footprintH: number | undefined;
    footprintOffsetX: number | undefined;
    // Both empty means the asset has no color.
    colorKey: string;
    colorHex: string;
    isAnimated: boolean;
    frameCount: number | undefined;
    frameDurationMs: number | undefined;
    loopForever: boolean;
    repeatCount: number | undefined;
};
