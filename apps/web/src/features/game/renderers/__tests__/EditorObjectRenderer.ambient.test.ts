import { describe, expect, it, vi } from "vitest";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import { AMBIENT_DATA_KEY } from "@/features/game/consts/render-on-demand";
import { EditorObjectRenderer } from "../EditorObjectRenderer";

// The loader reaches for the API, which a unit test has no address for.
vi.mock("@/features/editor/lib/loadAssetTexture", () => ({
    loadAssetTexture: vi.fn(),
}));

const MAP_HEIGHT = 640;

const asset = (id: string, overrides: Record<string, unknown> = {}) =>
    ({
        id,
        type: ASSET_TYPES.PLANT,
        placement: ASSET_PLACEMENTS.GROUND,
        solid: false,
        surfaceHeightPx: 0,
        sprite: { w: 32, h: 32 },
        footprint: { w: 1, h: 1, offsetX: 0 },
        animation: null,
        ...overrides,
    }) as unknown as AssetDefinition;

const placed = (id: string, assetId: string): PlacedAsset => ({
    id,
    assetId,
    tileX: 2,
    tileY: 3,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
});

const buildScene = (animations: string[]) => {
    const sprites: {
        play: ReturnType<typeof vi.fn>;
        setData: ReturnType<typeof vi.fn>;
    }[] = [];
    const sprite = () => {
        const made = {
            type: "Sprite",
            play: vi.fn(),
            setData: vi.fn(),
            setOrigin: vi.fn(() => made),
            setDepth: vi.fn(() => made),
            setName: vi.fn(() => made),
            setCrop: vi.fn(() => made),
            destroy: vi.fn(),
        };
        sprites.push(made);
        return made;
    };
    const scene = {
        textures: { exists: () => true },
        anims: { exists: (key: string) => animations.includes(key) },
        add: { sprite },
    };
    return { scene, sprites };
};

describe("EditorObjectRenderer scenery that animates", () => {
    it("marks the sprite of an animated object as ambient and plays its animation", () => {
        const { scene, sprites } = buildScene(["asset:water"]);
        const renderer = new EditorObjectRenderer(
            scene as never,
            [asset("water", { animation: { frameCount: 4, frameRate: 4 } })],
            MAP_HEIGHT
        );

        renderer.add(placed("p1", "water"));

        expect(sprites).toHaveLength(1);
        expect(sprites[0].play).toHaveBeenCalledWith("asset:water");
        expect(sprites[0].setData).toHaveBeenCalledWith(AMBIENT_DATA_KEY, true);
    });

    it("leaves a still object as it is, so a change of it is not read as ambient", () => {
        const { scene, sprites } = buildScene([]);
        const renderer = new EditorObjectRenderer(
            scene as never,
            [asset("crate")],
            MAP_HEIGHT
        );

        renderer.add(placed("p1", "crate"));

        expect(sprites[0].play).not.toHaveBeenCalled();
        expect(sprites[0].setData).not.toHaveBeenCalled();
    });

    it("does not mark a door, which only plays when its room opens or closes", () => {
        const { scene, sprites } = buildScene(["asset:door"]);
        const renderer = new EditorObjectRenderer(
            scene as never,
            [
                asset("door", {
                    type: ASSET_TYPES.DOOR,
                    animation: { frameCount: 4, frameRate: 8 },
                }),
            ],
            MAP_HEIGHT
        );

        renderer.add(placed("p1", "door"));

        expect(sprites[0].setData).not.toHaveBeenCalled();
    });
});
