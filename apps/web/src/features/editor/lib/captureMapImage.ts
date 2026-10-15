import type Phaser from "phaser";
import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import { EDITOR_THUMBNAIL } from "@/features/editor/consts/thumbnail";
import { sortByDepth } from "@/features/editor/utils/sortByDepth";
import type {
    ThumbnailDrawable,
    ThumbnailSize,
} from "@/features/editor/types/thumbnail";

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

// Draws the drawables on a texture the size of the whole map and hands its
// snapshot to `encode`. The snapshot is a pixel read of the whole texture, so
// it has exactly `mapSize` and nothing smooths it. The scene camera, the zoom
// and every editor overlay stay out of it, because only `drawables` are drawn
// and the texture has its own camera. The screen is never touched, so nothing
// flickers and nothing has to be restored.
export const captureMapImage = async <T>(
    scene: Phaser.Scene,
    drawables: readonly ThumbnailDrawable[],
    mapSize: ThumbnailSize,
    encode: (image: HTMLImageElement) => Promise<T>
): Promise<T> => {
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
        return await encode(await readSnapshot(texture));
    } finally {
        scene.textures.remove(EDITOR_THUMBNAIL.TEXTURE_KEY);
    }
};
