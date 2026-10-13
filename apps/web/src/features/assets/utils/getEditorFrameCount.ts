import { STATIC_FRAME_COUNT } from "../consts/frames";

// The frames the editor splits the crop into: the ones of the strip for an
// animated asset, one for any other.
export const getEditorFrameCount = (
    isAnimated: boolean,
    frameCount: number | undefined
): number => {
    if (!isAnimated) return STATIC_FRAME_COUNT;
    return frameCount ?? STATIC_FRAME_COUNT;
};
