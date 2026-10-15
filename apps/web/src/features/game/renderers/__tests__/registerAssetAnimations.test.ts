import { describe, expect, it } from "vitest";
import { registerAssetAnimations } from "../registerAssetAnimations";

const door = {
    id: "door-1",
    animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
};

const makeHost = (frames = 6) => {
    const created: Record<string, unknown>[] = [];
    const generated: unknown[][] = [];
    const host = {
        textures: {
            exists: () => frames > 0,
            get: () => ({
                getFrameNames: () =>
                    Array.from({ length: frames }, (_, i) => String(i)),
            }),
        },
        anims: {
            exists: (key: string) => created.some((anim) => anim.key === key),
            generateFrameNumbers: (...args: unknown[]) => {
                generated.push(args);
                return [{ key: "frames", frame: 0 }];
            },
            create: (config: Record<string, unknown>) => created.push(config),
        },
    };
    return { host, created, generated };
};

describe("registerAssetAnimations", () => {
    it("creates asset:{id} over the whole strip at 1000 / duration fps", () => {
        const { host, created, generated } = makeHost();
        registerAssetAnimations(host, [door]);

        expect(generated).toEqual([
            ["asset-tex:door-1", { start: 0, end: 5 }],
        ]);
        expect(created).toEqual([
            {
                key: "asset:door-1",
                frames: [{ key: "frames", frame: 0 }],
                frameRate: 10,
                repeat: -1,
            },
        ]);
    });

    it("gives variants of the same duration the same rate", () => {
        const { host, created } = makeHost();
        registerAssetAnimations(host, [door, { ...door, id: "door-2" }]);
        expect(created.map((anim) => anim.frameRate)).toEqual([10, 10]);
    });

    it("skips static assets, a missing texture and an existing animation", () => {
        const first = makeHost();
        registerAssetAnimations(first.host, [{ ...door, animation: null }]);
        expect(first.created).toEqual([]);

        const noTexture = makeHost(0);
        registerAssetAnimations(noTexture.host, [door]);
        expect(noTexture.created).toEqual([]);

        const twice = makeHost();
        registerAssetAnimations(twice.host, [door]);
        registerAssetAnimations(twice.host, [door]);
        expect(twice.created).toHaveLength(1);
    });

    it("skips a texture with fewer frames than frameCount", () => {
        const placeholder = makeHost(1);
        registerAssetAnimations(placeholder.host, [door]);
        expect(placeholder.created).toEqual([]);
    });
});
