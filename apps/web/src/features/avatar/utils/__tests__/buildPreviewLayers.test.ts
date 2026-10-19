import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import { buildPreviewLayers } from "../admin/buildPreviewLayers";

const base = new Uint8Array([1]);
const front = new Uint8Array([2]);

describe("buildPreviewLayers", () => {
    it("stacks the base and the front", () => {
        const layers = buildPreviewLayers({
            slot: AVATAR_SLOTS.OTHER,
            base,
            front,
        });

        expect(layers).toEqual([{ rgba: base }, { rgba: front }]);
    });

    it("draws a costume with no base", () => {
        const layers = buildPreviewLayers({
            slot: AVATAR_SLOTS.COSTUME,
            base,
            front,
        });

        expect(layers.map((layer) => layer.rgba)).toEqual([front]);
    });

    it("shows the part alone while the base is missing", () => {
        const layers = buildPreviewLayers({
            slot: AVATAR_SLOTS.HAIR,
            base: null,
            front,
        });

        expect(layers.map((layer) => layer.rgba)).toEqual([front]);
    });
});
