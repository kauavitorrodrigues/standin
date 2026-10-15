import { describe, expect, it } from "vitest";
import type { ModelDesk } from "@standin/contracts";
import { ERASE_TARGETS } from "@/features/editor/consts/erase-targets";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";
import {
    buildModel,
    placedAt,
} from "@/features/editor/utils/__tests__/placementTestKit";
import { buildMoveOps } from "@/features/editor/utils/buildMoveOps";
import { buildRemoveOps } from "@/features/editor/utils/buildRemoveOps";
import { getArrowDelta } from "@/features/editor/utils/getArrowDelta";
import { getDragTarget } from "@/features/editor/utils/getDragTarget";
import { getEraseTarget } from "@/features/editor/utils/getEraseTarget";
import { hitTestObjects } from "@/features/editor/utils/hitTestObjects";
import { pickSelectionTarget } from "@/features/editor/utils/pickSelectionTarget";
import { planMove } from "@/features/editor/utils/planMove";

// Every asset is a 32 px square, fully opaque unless the test says otherwise.
const surfaceWith = (alpha: ObjectSurface["getAlpha"]): ObjectSurface => ({
    getFrameSize: (assetId) =>
        assetId === "desk"
            ? { width: 96, height: 32 }
            : { width: 32, height: 32 },
    getAlpha: alpha,
});
const opaque = surfaceWith(() => 255);

const target = (
    kind: SelectionTarget["kind"],
    id: string,
    depth: number,
    area: number
): SelectionTarget => ({ kind, id, depth, area });

describe("pickSelectionTarget", () => {
    it("takes the greatest depth", () => {
        const winner = pickSelectionTarget([
            target("object", "low", 10, 1000),
            target("zone", "high", 20, 5000),
            null,
        ]);
        expect(winner?.id).toBe("high");
    });

    it("breaks a tie with the smaller area", () => {
        const winner = pickSelectionTarget([
            target("zone", "big", 5, 4000),
            target("zone", "small", 5, 100),
        ]);
        expect(winner?.id).toBe("small");
    });

    it("answers null when there is no target", () => {
        expect(pickSelectionTarget([null, null])).toBeNull();
        expect(pickSelectionTarget([])).toBeNull();
    });
});

describe("hitTestObjects", () => {
    it("picks the object with the greater depth where two overlap", () => {
        // Two tall sprites in one column: the lower row is drawn in front.
        // "back" covers y 64..128 and "front" y 96..160.
        const model = buildModel([
            placedAt("front", "crate", 2, 4),
            placedAt("back", "crate", 2, 3),
        ]);
        const tall: ObjectSurface = {
            getFrameSize: () => ({ width: 32, height: 64 }),
            getAlpha: () => 255,
        };
        const hit = hitTestObjects({
            model,
            worldX: 70,
            worldY: 110,
            surface: tall,
        });
        expect(hit?.id).toBe("front");
    });

    it("hits a transparent pixel inside the box of the sprite", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const transparent = surfaceWith(() => 0);

        const hit = hitTestObjects({
            model,
            worldX: 70,
            worldY: 140,
            surface: transparent,
        });

        expect(hit?.id).toBe("c");
    });

    it("picks an object standing in the empty corner of a bigger one", () => {
        // The desk is listed last, so it is the one drawn on top by the box.
        const model = buildModel([
            placedAt("chair", "crate", 3, 4),
            placedAt("desk-1", "desk", 2, 4),
        ]);
        const hollowDesk = surfaceWith((assetId) =>
            assetId === "desk" ? 0 : 255
        );

        const hit = hitTestObjects({
            model,
            worldX: 112,
            worldY: 140,
            surface: hollowDesk,
        });

        expect(hit?.id).toBe("chair");
    });

    it("still picks the desk on a pixel it draws", () => {
        const model = buildModel([
            placedAt("chair", "crate", 3, 4),
            placedAt("desk-1", "desk", 2, 4),
        ]);
        const hollowChair = surfaceWith((assetId) =>
            assetId === "crate" ? 0 : 255
        );

        const hit = hitTestObjects({
            model,
            worldX: 112,
            worldY: 140,
            surface: hollowChair,
        });

        expect(hit?.id).toBe("desk-1");
    });

    it("lets the object drawn lower win when both draw the pixel", () => {
        const model = buildModel([
            placedAt("back", "crate", 2, 3),
            placedAt("front", "crate", 2, 4),
        ]);
        const tall: ObjectSurface = {
            getFrameSize: () => ({ width: 32, height: 64 }),
            getAlpha: () => 255,
        };

        const hit = hitTestObjects({
            model,
            worldX: 70,
            worldY: 110,
            surface: tall,
        });

        expect(hit?.id).toBe("front");
    });

    it("misses the empty ground", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        expect(
            hitTestObjects({
                model,
                worldX: 250,
                worldY: 250,
                surface: opaque,
            })
        ).toBeNull();
    });

    it("selects a desk item over its desk (it draws just over the parent)", () => {
        const model = buildModel([
            placedAt("desk-1", "desk", 2, 4),
            placedAt("mon", "monitor", 3, 4, "desk-1"),
        ]);
        // The monitor sits 16 px up, over the middle cell of the desk.
        const hit = hitTestObjects({
            model,
            worldX: 100,
            worldY: 135,
            surface: opaque,
        });
        expect(hit?.id).toBe("mon");
    });

    it("uses the footprint box while the texture is unknown", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const unknown: ObjectSurface = {
            getFrameSize: () => null,
            getAlpha: () => null,
        };
        const hit = hitTestObjects({
            model,
            worldX: 70,
            worldY: 140,
            surface: unknown,
        });
        expect(hit?.id).toBe("c");
    });
});

describe("planMove", () => {
    it("accepts a free spot and carries the operation", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const plan = planMove({ model, id: "c", tileX: 5, tileY: 5 });

        expect(plan.reason).toBeNull();
        expect(plan.op).toEqual({
            type: "move_asset",
            id: "c",
            tileX: 5,
            tileY: 5,
        });
    });

    it("refuses a taken spot, but not the spot the object itself holds", () => {
        const model = buildModel([
            placedAt("c", "crate", 2, 4),
            placedAt("d", "crate", 5, 5),
        ]);

        expect(planMove({ model, id: "c", tileX: 5, tileY: 5 }).reason).toBe(
            "FOOTPRINT_OVERLAP"
        );
        expect(
            planMove({ model, id: "c", tileX: 2, tileY: 4 }).reason
        ).toBeNull();
    });

    it("refuses a spot outside the map", () => {
        const model = buildModel([placedAt("c", "crate", 0, 0)]);
        expect(planMove({ model, id: "c", tileX: -1, tileY: 0 }).reason).toBe(
            "CELL_OUT_OF_BOUNDS"
        );
    });

    it("moves a desk over its own old cells", () => {
        const model = buildModel([placedAt("desk-1", "desk", 2, 4)]);
        expect(
            planMove({ model, id: "desk-1", tileX: 3, tileY: 4 }).reason
        ).toBeNull();
    });
});

describe("getDragTarget", () => {
    it("follows the pointer by the same number of cells", () => {
        const model = buildModel([placedAt("c", "crate", 2, 4)]);
        const [placed] = model.placed;
        expect(
            getDragTarget({ model, placed, from: [2, 4], to: [5, 3] })
        ).toEqual({
            tileX: 5,
            tileY: 3,
            offsetX: 0,
            offsetY: 0,
            parentId: undefined,
        });
    });

    it("drags free by the same distance in px, keeping the grabbed point", () => {
        const model = buildModel([
            { ...placedAt("c", "crate", 2, 4), offsetX: 10, offsetY: 5 },
        ]);
        const [placed] = model.placed;
        expect(
            getDragTarget({
                model,
                placed,
                from: [2, 4],
                to: [3, 4],
                free: { startX: 80, startY: 140, x: 105, y: 133 },
            })
        ).toEqual({
            tileX: 3,
            tileY: 3,
            offsetX: 3,
            offsetY: 30,
            parentId: undefined,
        });
    });

    it("sends a SURFACE item to the desk under the pointer", () => {
        const model = buildModel([
            placedAt("desk-1", "desk", 5, 5),
            placedAt("mon", "monitor", 1, 1),
        ]);
        const placed = model.placed[1];
        const dragged = getDragTarget({
            model,
            placed,
            from: [1, 1],
            to: [6, 5],
        });

        expect(dragged).toEqual({
            tileX: 6,
            tileY: 5,
            offsetX: 0,
            offsetY: 0,
            parentId: "desk-1",
        });
        expect(planMove({ model, id: "mon", ...dragged }).reason).toBeNull();
    });

    it("refuses a SURFACE item dropped where there is no desk", () => {
        const model = buildModel([placedAt("mon", "monitor", 1, 1, null)]);
        const dragged = getDragTarget({
            model,
            placed: model.placed[0],
            from: [1, 1],
            to: [4, 4],
        });
        expect(dragged.parentId).toBeNull();
        expect(
            planMove({ model, id: "mon", ...dragged }).reason
        ).not.toBeNull();
    });
});

describe("buildMoveOps and getArrowDelta", () => {
    it("maps each arrow to one tile", () => {
        expect(getArrowDelta("up")).toEqual([0, -1]);
        expect(getArrowDelta("down")).toEqual([0, 1]);
        expect(getArrowDelta("left")).toEqual([-1, 0]);
        expect(getArrowDelta("right")).toEqual([1, 0]);
    });

    it("shifts only the selected objects that exist", () => {
        const model = buildModel([
            placedAt("a", "crate", 2, 2),
            placedAt("b", "crate", 6, 6),
        ]);
        expect(buildMoveOps(model, ["a", "ghost"], [1, 0])).toEqual([
            { type: "move_asset", id: "a", tileX: 3, tileY: 2 },
        ]);
    });

    it("leaves a child out when its parent moves too", () => {
        const model = buildModel([
            placedAt("desk-1", "desk", 2, 4),
            placedAt("mon", "monitor", 3, 4, "desk-1"),
        ]);
        const ops = buildMoveOps(model, ["desk-1", "mon"], [0, 1]);
        expect(ops).toHaveLength(1);
    });
});

describe("buildRemoveOps", () => {
    const claim: ModelDesk = { mapAssetId: "desk-1", userId: "user-1" };

    it("removes the existing objects of the list", () => {
        const model = buildModel([
            placedAt("a", "crate", 2, 2),
            placedAt("b", "crate", 6, 6),
        ]);
        const plan = buildRemoveOps({ model, ids: ["a", "nope"] });
        expect(plan.ops).toEqual([{ type: "remove_asset", id: "a" }]);
        expect(plan.claimedIds).toEqual([]);
    });

    it("holds back a claimed desk and names it", () => {
        const model = {
            ...buildModel([placedAt("desk-1", "desk", 2, 4)]),
            desks: [claim],
        };
        const plan = buildRemoveOps({ model, ids: ["desk-1"] });
        expect(plan.ops).toEqual([]);
        expect(plan.claimedIds).toEqual(["desk-1"]);
    });

    it("releases the desk once the owner was asked", () => {
        const model = {
            ...buildModel([placedAt("desk-1", "desk", 2, 4)]),
            desks: [claim],
        };
        const plan = buildRemoveOps({
            model,
            ids: ["desk-1"],
            releaseDesks: true,
        });
        expect(plan.ops).toEqual([
            { type: "remove_asset", id: "desk-1", releaseDesk: true },
        ]);
    });

    it("leaves a child out when its parent is removed too", () => {
        const model = buildModel([
            placedAt("desk-1", "desk", 2, 4),
            placedAt("mon", "monitor", 3, 4, "desk-1"),
        ]);
        const plan = buildRemoveOps({ model, ids: ["desk-1", "mon"] });
        expect(plan.ops).toHaveLength(1);
    });
});

describe("getEraseTarget", () => {
    it("erases objects on the Objects tab and tiles anywhere else", () => {
        expect(getEraseTarget(PANEL_TABS.OBJECTS)).toBe(ERASE_TARGETS.OBJECTS);
        expect(getEraseTarget(PANEL_TABS.TILES)).toBe(ERASE_TARGETS.TILES);
        expect(getEraseTarget(undefined)).toBe(ERASE_TARGETS.TILES);
    });
});
