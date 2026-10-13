import { z } from "zod/v4";
import { MIN_ANIMATION_FRAME_COUNT } from "../consts/library";
import { AssetErrorMessages as Messages } from "./consts/error-messages";

// A horizontal strip: `frameCount` frames of the same size, side by side, from
// left to right. One duration for every frame. `repeat` -1 is an infinite loop.
export const assetAnimationSchema = z.object({
    frameCount: z
        .number({ error: Messages.animationFrameCount.invalid })
        .int({ error: Messages.animationFrameCount.invalid })
        .min(MIN_ANIMATION_FRAME_COUNT, {
            error: Messages.animationFrameCount.invalid,
        }),
    frameDurationMs: z
        .number({ error: Messages.animationFrameDuration.invalid })
        .int({ error: Messages.animationFrameDuration.invalid })
        .positive({ error: Messages.animationFrameDuration.invalid }),
    repeat: z
        .number({ error: Messages.animationRepeat.invalid })
        .int({ error: Messages.animationRepeat.invalid })
        .min(-1, { error: Messages.animationRepeat.invalid }),
});
