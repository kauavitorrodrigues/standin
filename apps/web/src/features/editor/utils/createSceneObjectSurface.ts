import type Phaser from "phaser";
import { buildAssetTextureKey } from "@/features/game/utils/map";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";

// Reads the textures of the scene for the hit test. The key follows the
// renderer (`asset-tex:{id}`) and the first frame is the one a sprite starts on.
export const createSceneObjectSurface = (
    scene: Phaser.Scene
): ObjectSurface => ({
    getFrameSize: (assetId) => {
        const key = buildAssetTextureKey(assetId);
        if (!scene.textures.exists(key)) return null;

        const frame = scene.textures.getFrame(key);
        if (!frame) return null;
        return { width: frame.width, height: frame.height };
    },
    getAlpha: (assetId, x, y) => {
        const key = buildAssetTextureKey(assetId);
        if (!scene.textures.exists(key)) return null;
        // A texture the canvas cannot read leaves the box as the only answer.
        try {
            return scene.textures.getPixelAlpha(x, y, key);
        } catch {
            return null;
        }
    },
});
