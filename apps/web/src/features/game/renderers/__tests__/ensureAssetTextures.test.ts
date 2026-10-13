import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureAssetTextures } from "../ensureAssetTextures";

const makeHost = (existing: string[]) => {
    const calls: string[] = [];
    const rects: number[][] = [];
    const host = {
        exists: (key: string) => existing.includes(key),
        createCanvas: (key: string, width: number, height: number) => {
            calls.push(`${key}:${width}x${height}`);
            return {
                context: {
                    globalAlpha: 1,
                    fillStyle: "",
                    strokeStyle: "",
                    fillRect: (...args: number[]) => rects.push(args),
                    strokeRect: (...args: number[]) => rects.push(args),
                },
                refresh: () => undefined,
            };
        },
    };
    return { host, calls, rects };
};

afterEach(() => vi.restoreAllMocks());

describe("ensureAssetTextures", () => {
    it("leaves a loaded texture alone", () => {
        const { host, calls } = makeHost(["asset-tex:a"]);
        const replaced = ensureAssetTextures(host, [
            { id: "a", footprint: { w: 1, h: 1, offsetX: 0 } },
        ]);
        expect(calls).toEqual([]);
        expect(replaced).toEqual([]);
    });

    it("draws a footprint sized square and logs when the texture is missing", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const { host, calls } = makeHost([]);
        const replaced = ensureAssetTextures(host, [
            { id: "b", footprint: { w: 2, h: 1, offsetX: 0 } },
        ]);
        expect(calls).toEqual(["asset-tex:b:64x32"]);
        expect(replaced).toEqual(["b"]);
        expect(error).toHaveBeenCalledTimes(1);
    });
});
