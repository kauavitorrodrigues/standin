import type Phaser from "phaser";
import { captureMapImage } from "@/features/editor/lib/captureMapImage";
import { getThumbnailSize } from "@/features/editor/utils/getThumbnailSize";
import { scaleImageToBlob } from "@/features/editor/utils/scaleImageToBlob";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/editor/types/thumbnail";

// The map as a PNG at thumbnail size, for the photo in the map list.
export const captureMapThumbnail = (
    scene: Phaser.Scene,
    drawables: readonly ThumbnailDrawable[],
    mapSize: ThumbnailSize
): Promise<Blob> =>
    captureMapImage(scene, drawables, mapSize, (image) =>
        scaleImageToBlob(image, getThumbnailSize(mapSize))
    );
