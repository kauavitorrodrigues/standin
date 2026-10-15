import { describe, expect, it } from "vitest";
import { generateBlankLayout } from "@standin/contracts";
import type { EditorModel, PlacedAsset } from "@standin/contracts";
import { planModelDiff } from "../planModelDiff";

const layout = generateBlankLayout("XS", {
    floor: { tilesetId: "floor", tileCount: 4, tileIndex: 0 },
});

const placed = (id: string, overrides: Partial<PlacedAsset> = {}) =>
    ({
        id,
        assetId: "asset",
        tileX: 1,
        tileY: 1,
        parentId: null,
        propertyOverrides: null,
        ...overrides,
    }) as PlacedAsset;

const model = (items: PlacedAsset[] = [], base = layout): EditorModel => ({
    mapId: "m",
    width: base.width,
    height: base.height,
    layout: structuredClone(base),
    placed: items,
    library: { tilesets: [], assets: [] } as unknown as EditorModel["library"],
    desks: [],
    limits: { objectsUsed: items.length, objectsMax: 100 },
    version: 1,
});

describe("planModelDiff", () => {
    it("plans nothing when the models are equal", () => {
        const items = [placed("a")];

        expect(
            planModelDiff(model(items), model(structuredClone(items)))
        ).toEqual({
            layoutChanged: false,
            inserts: [],
            updates: [],
            deletes: [],
        });
    });

    it("flags only the layout when only the layout changes", () => {
        const after = model();
        after.layout.layers[0] = { ...after.layout.layers[0], name: "other" };

        const plan = planModelDiff(model(), after);

        expect(plan.layoutChanged).toBe(true);
        expect(plan.inserts).toEqual([]);
        expect(plan.updates).toEqual([]);
        expect(plan.deletes).toEqual([]);
    });

    it("plans only objects when the layout is equal", () => {
        const plan = planModelDiff(model(), model([placed("temp-1")]));

        expect(plan.layoutChanged).toBe(false);
        expect(plan.inserts.map(({ id }) => id)).toEqual(["temp-1"]);
    });

    it("puts a new parent before its child, whatever the input order", () => {
        const child = placed("temp-child", { parentId: "temp-parent" });
        const parent = placed("temp-parent");

        const plan = planModelDiff(model(), model([child, parent]));

        expect(plan.inserts.map(({ id }) => id)).toEqual([
            "temp-parent",
            "temp-child",
        ]);
    });

    it("orders a chain of three from the root down", () => {
        const items = [
            placed("c", { parentId: "b" }),
            placed("b", { parentId: "a" }),
            placed("a"),
        ];

        const plan = planModelDiff(model(), model(items));

        expect(plan.inserts.map(({ id }) => id)).toEqual(["a", "b", "c"]);
    });

    it("plans an update when the position changes", () => {
        const plan = planModelDiff(
            model([placed("a")]),
            model([placed("a", { tileX: 5 })])
        );

        expect(plan.updates.map(({ id }) => id)).toEqual(["a"]);
        expect(plan.inserts).toEqual([]);
    });

    it("plans an update when the parent or the asset changes", () => {
        const plan = planModelDiff(
            model([placed("a"), placed("b"), placed("c")]),
            model([
                placed("a"),
                placed("b", { parentId: "a" }),
                placed("c", { assetId: "other" }),
            ])
        );

        expect(plan.updates.map(({ id }) => id)).toEqual(["b", "c"]);
    });

    it("plans a delete for ids that left the model", () => {
        const plan = planModelDiff(
            model([placed("a"), placed("b")]),
            model([placed("b")])
        );

        expect(plan.deletes).toEqual(["a"]);
        expect(plan.updates).toEqual([]);
    });
});
