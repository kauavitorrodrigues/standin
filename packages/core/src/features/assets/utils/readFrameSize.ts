import {
    AnimationFrameWidthInvalidIssue,
    SpriteSizeNotMultipleOfTileIssue,
    TILE_SIZE,
} from "@standin/contracts";
import type { LibraryIssue } from "@standin/contracts";
import type { ImageSize } from "../../../lib/types";

type Result = {
    frame: { w: number; h: number } | null;
    issues: LibraryIssue[];
};

/**
 * The size of one frame of an asset PNG. A static asset is the whole image,
 * an animated one is a horizontal strip of `frameCount` equal frames. Both
 * sides of the frame have to be multiples of the tile size.
 */
export const readFrameSize = (
    size: ImageSize,
    frameCount: number | null
): Result => {
    const count = frameCount ?? 1;
    if (size.width % count !== 0) {
        return {
            frame: null,
            issues: [new AnimationFrameWidthInvalidIssue(size.width, count)],
        };
    }

    const frame = { w: size.width / count, h: size.height };
    if (frame.w % TILE_SIZE !== 0 || frame.h % TILE_SIZE !== 0) {
        return {
            frame: null,
            issues: [new SpriteSizeNotMultipleOfTileIssue(frame)],
        };
    }
    return { frame, issues: [] };
};
