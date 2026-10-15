import { describe, expect, it } from "vitest";
import { buildReplaceOps } from "@/features/editor/utils/buildReplaceOps";
import { buildRotateOps } from "@/features/editor/utils/buildRotateOps";
import { getObjectToolbarControls } from "@/features/editor/utils/getObjectToolbarControls";
import {
    buildToolbarModel,
    couch,
    lamp,
    placedAt,
    sofa,
    sofa90,
    sofaBlue,
} from "@/features/editor/utils/__tests__/objectToolbarKit";

describe("getObjectToolbarControls", () => {
    it("shows model, color and rotation for a sofa with all of them", () => {
        const model = buildToolbarModel([placedAt("a", "sofa", 2, 4)]);

        const controls = getObjectToolbarControls(model, "a");

        expect(controls?.showModel).toBe(true);
        expect(controls?.showColor).toBe(true);
        expect(controls?.showRotate).toBe(true);
        expect(controls?.alternatives.colors.map(({ id }) => id)).toEqual([
            "sofa-blue",
        ]);
        expect(controls?.alternatives.models.map(({ id }) => id)).toEqual([
            "couch",
        ]);
    });

    it("keeps the models in the same order whichever one is the current", () => {
        const assets = [sofa, sofaBlue, sofa90, couch, lamp];
        const onSofa = buildToolbarModel([placedAt("a", "sofa", 2, 4)], assets);
        const onCouch = buildToolbarModel(
            [placedAt("a", "couch", 2, 4)],
            assets
        );

        const ids = (model: typeof onSofa) =>
            getObjectToolbarControls(model, "a")?.modelChoices.map(
                ({ id }) => id
            );

        expect(ids(onSofa)).toEqual(["sofa", "couch"]);
        expect(ids(onCouch)).toEqual(["sofa", "couch"]);
    });

    it("shows only the controls that apply", () => {
        const model = buildToolbarModel(
            [placedAt("a", "sofa", 2, 4)],
            [sofa, sofaBlue]
        );

        const controls = getObjectToolbarControls(model, "a");

        expect(controls?.showColor).toBe(true);
        expect(controls?.showModel).toBe(false);
        expect(controls?.showRotate).toBe(false);
    });

    it("hides model, color and rotation for an object alone in its kind", () => {
        const model = buildToolbarModel([placedAt("a", "lamp", 2, 4)], [lamp]);

        const controls = getObjectToolbarControls(model, "a");

        expect(controls?.showModel).toBe(false);
        expect(controls?.showColor).toBe(false);
        expect(controls?.showRotate).toBe(false);
    });

    it("hides a model that does not fit", () => {
        // The couch would overlap the crate-like neighbour at (4, 4).
        const model = buildToolbarModel(
            [placedAt("a", "sofa", 2, 4), placedAt("b", "lamp", 3, 4)],
            [
                { ...sofa },
                { ...couch, footprint: { w: 3, h: 1, offsetX: 0 } },
                lamp,
            ]
        );

        expect(getObjectToolbarControls(model, "a")?.showModel).toBe(false);
    });

    it("is null for an id that is not a placed object", () => {
        const model = buildToolbarModel([placedAt("a", "sofa", 2, 4)]);

        expect(getObjectToolbarControls(model, "zone-1")).toBeNull();
    });
});

describe("replace and rotate ops", () => {
    it("builds one replace_asset", () => {
        expect(buildReplaceOps("a", "sofa-blue")).toEqual([
            { type: "replace_asset", id: "a", assetId: "sofa-blue" },
        ]);
    });

    it("rotates to the next rotation of the family", () => {
        const model = buildToolbarModel([placedAt("a", "sofa", 2, 4)]);

        expect(buildRotateOps(model, "a")).toEqual([
            { type: "replace_asset", id: "a", assetId: "sofa-90" },
        ]);
    });

    it("builds nothing when there is no other rotation", () => {
        const model = buildToolbarModel([placedAt("a", "lamp", 2, 4)]);

        expect(buildRotateOps(model, "a")).toEqual([]);
    });
});
