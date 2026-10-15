import { beforeEach, describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import { captureNativeSnapshot } from "@/features/editor/lib/captureNativeSnapshot";
import { captureMapThumbnail } from "@/features/editor/lib/captureMapThumbnail";
import { EDITOR_THUMBNAIL } from "@/features/editor/consts/thumbnail";

const scaleImageToBlob = vi.hoisted(() => vi.fn());
vi.mock("@/features/editor/utils/scaleImageToBlob", () => ({
    scaleImageToBlob,
}));

const cropImageToBlob = vi.hoisted(() => vi.fn());
vi.mock("@/features/editor/utils/cropImageToBlob", () => ({
    cropImageToBlob,
}));

const MAP_SIZE = { width: 12 * 32, height: 8 * 32 };

const buildScene = (image: unknown) => {
    const texture = {
        draw: vi.fn(),
        snapshot: vi.fn((callback: (value: unknown) => void) =>
            callback(image)
        ),
    };
    const textures = {
        addDynamicTexture: vi.fn(() => texture),
        remove: vi.fn(),
    };
    return {
        scene: { textures } as unknown as Phaser.Scene,
        texture,
        textures,
    };
};

describe("captureNativeSnapshot", () => {
    beforeEach(() => {
        scaleImageToBlob.mockReset();
        cropImageToBlob.mockReset();
        cropImageToBlob.mockResolvedValue(new Blob(["crop"]));
        scaleImageToBlob.mockResolvedValue(new Blob(["png"]));
    });

    it("draws on a texture of the exact map size and snapshots all of it", async () => {
        const image = new Image();
        const { scene, texture, textures } = buildScene(image);

        await captureNativeSnapshot(scene, [], MAP_SIZE);

        expect(textures.addDynamicTexture).toHaveBeenCalledWith(
            EDITOR_THUMBNAIL.TEXTURE_KEY,
            384,
            256
        );
        // `snapshot` reads the whole texture with no resampling, so the
        // image has the texture size whatever `pixelArt` says.
        expect(texture.snapshot).toHaveBeenCalledTimes(1);
        expect(texture.snapshot.mock.calls[0]).toHaveLength(1);
    });

    it("encodes the snapshot at the map size, with no scaling", async () => {
        const image = new Image();
        const { scene } = buildScene(image);

        await captureNativeSnapshot(scene, [], MAP_SIZE);

        expect(scaleImageToBlob).toHaveBeenCalledWith(image, MAP_SIZE);
    });

    it("encodes only the requested region of tiles when given a rectangle", async () => {
        const image = new Image();
        const { scene } = buildScene(image);
        const rect = { x: 2, y: 1, w: 4, h: 3 };

        await captureNativeSnapshot(scene, [], MAP_SIZE, rect);

        expect(cropImageToBlob).toHaveBeenCalledWith(image, rect);
        expect(scaleImageToBlob).not.toHaveBeenCalled();
    });

    it("keeps the thumbnail variant scaled down", async () => {
        const { scene } = buildScene(new Image());
        const big = { width: 40 * 32, height: 30 * 32 };

        await captureMapThumbnail(scene, [], big);

        const size = scaleImageToBlob.mock.calls[0][1];
        expect(Math.max(size.width, size.height)).toBe(
            EDITOR_THUMBNAIL.MAX_SIDE
        );
    });

    it("removes the temporary texture and rejects when the snapshot fails", async () => {
        const { scene, textures } = buildScene(undefined);

        await expect(
            captureNativeSnapshot(scene, [], MAP_SIZE)
        ).rejects.toThrow();
        expect(textures.remove).toHaveBeenCalledWith(
            EDITOR_THUMBNAIL.TEXTURE_KEY
        );
    });
});
