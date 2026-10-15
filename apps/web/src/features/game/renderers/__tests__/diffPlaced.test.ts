import { describe, expect, it } from "vitest";
import type { PlacedAsset } from "@standin/contracts";
import { diffPlaced } from "@/features/game/renderers/diffPlaced";

const placed = (
    id: string,
    overrides: Partial<PlacedAsset> = {}
): PlacedAsset => ({
    id,
    assetId: "a1",
    tileX: 1,
    tileY: 1,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
    ...overrides,
});

describe("diffPlaced", () => {
    it("is empty when nothing changed", () => {
        const list = [placed("p1"), placed("p2")];

        expect(diffPlaced(list, structuredClone(list))).toEqual({
            added: [],
            moved: [],
            replaced: [],
            removed: [],
        });
    });

    it("separates added, moved, replaced and removed", () => {
        const previous = [
            placed("p1"),
            placed("p2"),
            placed("p3"),
            placed("p4"),
        ];
        const next = [
            placed("p1", { tileX: 5 }),
            placed("p2", { assetId: "a2" }),
            placed("p3"),
            placed("p5"),
        ];

        const diff = diffPlaced(previous, next);

        expect(diff.moved.map((item) => item.id)).toEqual(["p1"]);
        expect(diff.replaced.map((item) => item.id)).toEqual(["p2"]);
        expect(diff.added.map((item) => item.id)).toEqual(["p5"]);
        expect(diff.removed).toEqual(["p4"]);
    });

    it("counts a change of asset and cell as replaced only", () => {
        const diff = diffPlaced(
            [placed("p1")],
            [placed("p1", { assetId: "a2", tileX: 9 })]
        );

        expect(diff.replaced).toHaveLength(1);
        expect(diff.moved).toHaveLength(0);
    });

    it("treats a new parent as a move and ignores property overrides", () => {
        const diff = diffPlaced(
            [placed("p1"), placed("p2")],
            [
                placed("p1", { parentId: "p9" }),
                placed("p2", { propertyOverrides: { color: "red" } }),
            ]
        );

        expect(diff.moved.map((item) => item.id)).toEqual(["p1"]);
        expect(diff.replaced).toHaveLength(0);
    });
});
