import { describe, expect, it } from "vitest";
import { buildAssetChanges } from "../buildChanges";
import { toEditAssetValues } from "../toEditValues";
import { definition } from "./fixtures";

const initial = toEditAssetValues(definition());

describe("buildAssetChanges", () => {
    it("is empty when nothing changed", () => {
        expect(buildAssetChanges(initial, { ...initial })).toEqual({});
    });

    it("sends only the fields that changed", () => {
        expect(
            buildAssetChanges(initial, {
                ...initial,
                name: "Caneca grande",
                solid: true,
            })
        ).toEqual({ name: "Caneca grande", solid: true });
    });

    it("turns an empty prompt into null", () => {
        const withPrompt = { ...initial, promptText: "Beber" };
        expect(
            buildAssetChanges(withPrompt, { ...withPrompt, promptText: "" })
        ).toEqual({ promptText: null });
    });

    it("sends animation edits without the frame count", () => {
        const animated = toEditAssetValues(
            definition({
                animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
            })
        );
        expect(
            buildAssetChanges(animated, {
                ...animated,
                frameDurationMs: 80,
                loopForever: false,
                repeatCount: 3,
            })
        ).toEqual({ animation: { frameDurationMs: 80, repeat: 3 } });
    });
});

describe("toEditAssetValues", () => {
    it("reads an infinite loop as loopForever", () => {
        const values = toEditAssetValues(
            definition({
                animation: { frameCount: 2, frameDurationMs: 100, repeat: -1 },
            })
        );
        expect(values.loopForever).toBe(true);
        expect(values.frameDurationMs).toBe(100);
    });
});
