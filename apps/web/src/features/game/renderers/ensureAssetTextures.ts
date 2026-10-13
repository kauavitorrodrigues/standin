import { TILE_SIZE, type AssetDefinition } from "@standin/contracts";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";
import { buildAssetTextureKey } from "@/features/game/utils/map";

const PLACEHOLDER_FILL = "#ff00ff";
const PLACEHOLDER_STROKE = "#000000";
const PLACEHOLDER_ALPHA = 0.5;

type PlaceholderCanvas = {
    context: {
        globalAlpha: number;
        fillStyle: string | CanvasGradient | CanvasPattern;
        strokeStyle: string | CanvasGradient | CanvasPattern;
        fillRect: (x: number, y: number, w: number, h: number) => void;
        strokeRect: (x: number, y: number, w: number, h: number) => void;
    };
    refresh: () => unknown;
};

// The parts of the Phaser texture manager the check needs, so it can run
// without a scene.
export type TextureHost = {
    exists: (key: string) => boolean;
    createCanvas: (
        key: string,
        width: number,
        height: number
    ) => PlaceholderCanvas | null;
};

/**
 * Draws a square of the footprint size for each asset whose texture did not
 * load, under the same key, and logs the error. Returns the ids of the assets
 * that got a placeholder, so nothing tries to animate them.
 */
export const ensureAssetTextures = (
    textures: TextureHost,
    assets: Pick<AssetDefinition, "id" | "footprint">[]
): string[] => {
    const replaced: string[] = [];

    for (const asset of assets) {
        const key = buildAssetTextureKey(asset.id);
        if (textures.exists(key)) continue;

        console.error(GAME_DIAGNOSTIC_MESSAGES.assetTextureMissing(asset.id));

        const width = asset.footprint.w * TILE_SIZE;
        const height = asset.footprint.h * TILE_SIZE;
        const canvas = textures.createCanvas(key, width, height);
        if (!canvas) continue;

        const { context } = canvas;
        context.globalAlpha = PLACEHOLDER_ALPHA;
        context.fillStyle = PLACEHOLDER_FILL;
        context.fillRect(0, 0, width, height);
        context.globalAlpha = 1;
        context.strokeStyle = PLACEHOLDER_STROKE;
        context.strokeRect(0, 0, width, height);
        canvas.refresh();

        replaced.push(asset.id);
    }

    return replaced;
};
