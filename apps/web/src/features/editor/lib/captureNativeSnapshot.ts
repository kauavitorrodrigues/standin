import type Phaser from "phaser";
import { captureMapImage } from "@/features/editor/lib/captureMapImage";
import { cropImageToBlob } from "@/features/editor/utils/cropImageToBlob";
import { scaleImageToBlob } from "@/features/editor/utils/scaleImageToBlob";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/editor/types/thumbnail";
import type { TileRect } from "@/features/editor/types/tile-rect";

// The map as a PNG at its native resolution, with no scaling. Without `rect`
// it is the whole map (`mapSize`, width * 32 by height * 32). With `rect`, in
// tiles, it is only that region (`rect.w * 32` by `rect.h * 32`). Used by the
// thumbnail of an area, shown 1 to 1 as a ghost.
export const captureNativeSnapshot = (
    scene: Phaser.Scene,
    drawables: readonly ThumbnailDrawable[],
    mapSize: ThumbnailSize,
    rect?: TileRect
): Promise<Blob> =>
    captureMapImage(scene, drawables, mapSize, (image) =>
        rect ? cropImageToBlob(image, rect) : scaleImageToBlob(image, mapSize)
    );
