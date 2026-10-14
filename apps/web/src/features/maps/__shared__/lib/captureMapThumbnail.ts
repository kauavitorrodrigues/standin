import type Phaser from "phaser";
import { THUMBNAIL_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { EDITOR_THUMBNAIL } from "@/features/maps/__shared__/consts/thumbnail";
import { getThumbnailSize } from "@/features/maps/__shared__/utils/getThumbnailSize";
import { scaleImageToBlob } from "@/features/maps/__shared__/utils/scaleImageToBlob";
import { sortByDepth } from "@/features/maps/__shared__/utils/sortByDepth";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/maps/__shared__/types/thumbnail";

const readSnapshot = (
    texture: Phaser.Textures.DynamicTexture
): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        texture.snapshot((snapshot) => {
            if (snapshot instanceof HTMLImageElement) {
                resolve(snapshot);
                return;
            }
            reject(new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED));
        });
    });

// Draws the given tile layers and objects on a texture the size of the whole
// map and returns it as a PNG at thumbnail size. The scene camera, the zoom
// and every editor overlay stay out of it, because only `drawables` are drawn
// and the texture has its own camera. The screen is never touched, so nothing
// flickers and nothing has to be restored.
export const captureMapThumbnail = async (
    scene: Phaser.Scene,
    drawables: readonly ThumbnailDrawable[],
    mapSize: ThumbnailSize
): Promise<Blob> => {
    const texture = scene.textures.addDynamicTexture(
        EDITOR_THUMBNAIL.TEXTURE_KEY,
        mapSize.width,
        mapSize.height
    );
    if (!texture) {
        throw new Error(THUMBNAIL_MESSAGES.CAPTURE_FAILED);
    }

    try {
        texture.draw(sortByDepth(drawables));
        const image = await readSnapshot(texture);
        return await scaleImageToBlob(image, getThumbnailSize(mapSize));
    } finally {
        scene.textures.remove(EDITOR_THUMBNAIL.TEXTURE_KEY);
    }
};
