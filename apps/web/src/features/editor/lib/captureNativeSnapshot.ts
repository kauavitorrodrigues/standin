import type Phaser from "phaser";
import { captureMapImage } from "@/features/editor/lib/captureMapImage";
import { scaleImageToBlob } from "@/features/editor/utils/scaleImageToBlob";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/editor/types/thumbnail";

// The map as a PNG at its exact size (`mapSize`, width * 32 by height * 32),
// with no scaling. Used by the thumbnail of an area, shown 1 to 1 as a ghost.
export const captureNativeSnapshot = (
    scene: Phaser.Scene,
    drawables: readonly ThumbnailDrawable[],
    mapSize: ThumbnailSize
): Promise<Blob> =>
    captureMapImage(scene, drawables, mapSize, (image) =>
        scaleImageToBlob(image, mapSize)
    );
