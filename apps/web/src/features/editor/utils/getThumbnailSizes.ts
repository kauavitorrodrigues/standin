import type { AssetDefinition } from "@standin/contracts";
import { STATIC_FRAME_COUNT } from "@/features/assets/consts/frames";

export type ThumbnailSizes = {
    // The first frame, scaled into the box.
    frame: { width: number; height: number };
    // The whole image, scaled the same. An animated asset is a strip of
    // frames, and only the first shows inside the frame.
    strip: { width: number; height: number };
};

// The sizes in px to show the first frame of an asset in a square box.
export const getThumbnailSizes = (
    asset: Pick<AssetDefinition, "sprite" | "animation">,
    boxPx: number
): ThumbnailSizes => {
    const { sprite } = asset;
    const frameCount = asset.animation?.frameCount ?? STATIC_FRAME_COUNT;
    const scale = boxPx / Math.max(sprite.w, sprite.h);

    return {
        frame: { width: sprite.w * scale, height: sprite.h * scale },
        strip: {
            width: sprite.w * frameCount * scale,
            height: sprite.h * scale,
        },
    };
};
