import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameMapData } from "@/features/game/types/tilemap";

const mocks = vi.hoisted(() => ({
    buildTilemap: vi.fn(),
    renderTileLayers: vi.fn(),
    renderWallTiles: vi.fn(),
    renderPlacedAssets: vi.fn(),
    captureMapThumbnail: vi.fn(),
}));

vi.mock("phaser", () => ({
    default: {
        Scene: class {
            cameras = {
                main: {
                    width: 640,
                    height: 480,
                    setZoom: vi.fn(),
                    centerOn: vi.fn(),
                },
            };
            textures = {};
        },
    },
}));
vi.mock("@/features/game/renderers", () => ({
    buildTilemap: mocks.buildTilemap,
    ensureAssetTextures: vi.fn(),
    loadMapAssets: vi.fn(),
    registerAssetAnimations: vi.fn(),
    renderPlacedAssets: mocks.renderPlacedAssets,
    renderTileLayers: mocks.renderTileLayers,
    renderWallTiles: mocks.renderWallTiles,
}));
vi.mock("@/features/editor/lib/captureMapThumbnail", () => ({
    captureMapThumbnail: mocks.captureMapThumbnail,
}));

import { MapPreviewScene } from "../MapPreviewScene";

const floor = { name: "floor", depth: 0 };
const furniture = { name: "furniture", depth: 3 };
const wallImage = { name: "wall", depth: 2 };
const sprite = { name: "sprite", depth: 5 };
const photo = new Blob(["png"]);

const map = { id: "m1", assets: [], placed: [] } as unknown as GameMapData;

const build = (
    onDrawn?: (scene: MapPreviewScene) => void,
    onFailed?: (cause: unknown) => void
) => {
    const scene = new MapPreviewScene();
    scene.init({ map, onDrawn, onFailed });
    return scene;
};

describe("MapPreviewScene", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.buildTilemap.mockReturnValue({
            tilemap: { widthInPixels: 320, heightInPixels: 256 },
            tilesets: [],
        });
        mocks.renderTileLayers.mockReturnValue([floor, furniture]);
        mocks.renderWallTiles.mockReturnValue({
            getDisplays: () => [wallImage],
        });
        mocks.renderPlacedAssets.mockReturnValue([sprite]);
        mocks.captureMapThumbnail.mockResolvedValue(photo);
    });

    it("photographs the tile layers, the walls and the objects, at the size of the map", async () => {
        const scene = build();
        scene.create();

        await expect(scene.captureThumbnail()).resolves.toBe(photo);

        expect(mocks.captureMapThumbnail).toHaveBeenCalledWith(
            scene,
            [floor, furniture, wallImage, sprite],
            { width: 320, height: 256 }
        );
    });

    it("leaves the wall layer to the wall renderer, as the preview always did", () => {
        build().create();

        expect(mocks.renderTileLayers).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            { skip: ["walls"] }
        );
    });

    it("says it drew, with itself, once the map is on the scene", () => {
        const onDrawn = vi.fn();
        const scene = build(onDrawn);

        scene.create();

        expect(onDrawn).toHaveBeenCalledTimes(1);
        expect(onDrawn).toHaveBeenCalledWith(scene);
    });

    it("says it drew only after fitting the camera, so the photo does not depend on it", () => {
        const order: string[] = [];
        const scene = build(() => order.push("drawn"));
        const fit = vi.spyOn(scene, "fitToViewport").mockImplementation(() => {
            order.push("fit");
        });

        scene.create();

        expect(fit).toHaveBeenCalled();
        expect(order).toEqual(["fit", "drawn"]);
    });

    it("works as the visible preview does, with no one waiting for the draw", () => {
        const scene = build();

        expect(() => scene.create()).not.toThrow();
    });

    describe("when the map cannot be drawn", () => {
        const failure = new Error("bad tileset");

        beforeEach(() => {
            mocks.buildTilemap.mockImplementation(() => {
                throw failure;
            });
        });

        it("tells who is waiting instead of throwing", () => {
            const onFailed = vi.fn();
            const onDrawn = vi.fn();

            expect(() => build(onDrawn, onFailed).create()).not.toThrow();

            expect(onFailed).toHaveBeenCalledWith(failure);
            expect(onDrawn).not.toHaveBeenCalled();
        });

        it("throws as it always did when nobody is waiting", () => {
            expect(() => build().create()).toThrow(failure);
        });
    });
});
