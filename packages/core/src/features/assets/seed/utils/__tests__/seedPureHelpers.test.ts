import type { AvatarPart } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SEED_ACTIONS } from "../../types";
import type {
    SeedAsset,
    SeedAvatarPart,
    SeedBundle,
    SeedStamp,
} from "../../types";
import { areSameBundleParts } from "../areSameBundleParts";
import { buildAssetUpdateBody } from "../buildAssetUpdateBody";
import { buildBaseUpdateBody } from "../buildBaseUpdateBody";
import { buildBundleLabel } from "../buildBundleLabel";
import { buildEntryLabel } from "../buildEntryLabel";
import { buildPartUpdateBody } from "../buildPartUpdateBody";
import { buildVariationLabel } from "../buildVariationLabel";
import { decideAction } from "../decideAction";
import { decideBundleAction } from "../decideBundleAction";
import { diffAvatarBase } from "../diffAvatarBase";
import { diffAvatarPart } from "../diffAvatarPart";
import { diffTileset } from "../diffTileset";
import { isSameAreaData } from "../isSameAreaData";
import { replaceStampKeys } from "../replaceStampKeys";
import { resolveBundleParts } from "../resolveBundleParts";
import { pickCreatedVariation } from "../pickCreatedVariation";
import { runSequentially } from "../runSequentially";
import { stripUndefined } from "../stripUndefined";

const png = Buffer.from("x");
const part = (id: string, offsetX = 0) => ({
    partAssetId: id,
    offsetX,
    offsetY: 0,
});

describe("runSequentially", () => {
    it("returns the results in order, one step at a time", async () => {
        let running = 0;
        let overlap = false;
        const results = await runSequentially([30, 1, 10], async (ms, i) => {
            running += 1;
            overlap = overlap || running > 1;
            await new Promise((resolve) => setTimeout(resolve, ms));
            running -= 1;
            return `${i}:${ms}`;
        });
        expect(results).toEqual(["0:30", "1:1", "2:10"]);
        expect(overlap).toBe(false);
    });

    it("stops at the first rejection and skips the later items", async () => {
        const ran: number[] = [];
        const run = runSequentially([1, 2, 3], async (n) => {
            ran.push(n);
            if (n === 2) throw new Error("boom");
            return n;
        });
        await expect(run).rejects.toThrow("boom");
        expect(ran).toEqual([1, 2]);
    });

    it("resolves an empty list to an empty list", async () => {
        expect(await runSequentially([], async (n) => n)).toEqual([]);
    });
});

describe("labels", () => {
    it("names an entry, a bundle and a variation", () => {
        expect(buildEntryLabel("areas", "town")).toBe('areas "town"');
        expect(buildBundleLabel(2, "tree")).toBe('bundles[2] "tree"');
        expect(buildVariationLabel('avatarParts "hair"', "red")).toBe(
            'avatarParts "hair" variation "red"'
        );
    });
});

describe("decideAction", () => {
    it("updates when changed and leaves it otherwise", () => {
        expect(decideAction(true)).toBe(SEED_ACTIONS.UPDATE);
        expect(decideAction(false)).toBe(SEED_ACTIONS.UNCHANGED);
    });
});

describe("bundle helpers", () => {
    it("compares parts in any order", () => {
        expect(
            areSameBundleParts([part("a"), part("b")], [part("b"), part("a")])
        ).toBe(true);
        expect(areSameBundleParts([part("a")], [part("a", 1)])).toBe(false);
    });

    it("decides create, update or unchanged", () => {
        expect(decideBundleAction([part("a")], [part("a")])).toBe(
            SEED_ACTIONS.UNCHANGED
        );
        expect(decideBundleAction([], [part("a")])).toBe(SEED_ACTIONS.CREATE);
        expect(decideBundleAction([part("a")], [])).toBe(SEED_ACTIONS.UPDATE);
    });

    it("swaps keys for ids and collects every missing key", () => {
        const entry: SeedBundle = {
            asset: "root",
            parts: [
                { partAsset: "a", offsetX: 1, offsetY: 2 },
                { partAsset: "b", offsetX: 0, offsetY: 0 },
            ],
        };
        const found = resolveBundleParts(
            entry,
            new Map([
                ["root", "r"],
                ["a", "1"],
            ])
        );
        expect(found.rootId).toBe("r");
        expect(found.parts[0]).toEqual({
            partAssetId: "1",
            offsetX: 1,
            offsetY: 2,
        });
        expect(found.missing).toEqual([
            { field: "parts[1].partAsset", key: "b" },
        ]);
        expect(resolveBundleParts(entry, new Map()).missing).toHaveLength(3);
    });
});

describe("replaceStampKeys", () => {
    it("swaps tileset and asset keys and collects the unknown ones", () => {
        const stamp = {
            palette: [{ tilesetKey: "t", x: 1 }],
            objects: [{ assetKey: "gone", y: 2 }],
        } as unknown as SeedStamp;
        const out = replaceStampKeys(stamp, new Map([["t", "T1"]]), new Map());
        expect(out.palette).toEqual([{ x: 1, tilesetId: "T1" }]);
        expect(out.missing).toEqual([
            { field: "stamp.objects[0].assetKey", key: "gone" },
        ]);
    });
});

describe("isSameAreaData", () => {
    it("ignores key order in the stamp and compares the name", () => {
        const a = { name: "n", stamp: { x: 1, y: 2 } };
        expect(isSameAreaData(a, { name: "n", stamp: { y: 2, x: 1 } })).toBe(
            true
        );
        expect(isSameAreaData(a, { name: "m", stamp: a.stamp })).toBe(false);
    });
});

describe("avatar diffs and bodies", () => {
    const base = { key: "k", name: "New", image: png };

    it("diffs a base and builds the body of what changed", () => {
        const changes = diffAvatarBase(
            { ...base, isDefault: true },
            { name: "Old", isDefault: false }
        );
        expect(changes).toEqual({ nameChanged: true, becomesDefault: true });
        expect(
            buildBaseUpdateBody({ ...base, isDefault: true }, changes)
        ).toEqual({
            name: "New",
            isDefault: true,
        });
        expect(
            buildBaseUpdateBody(base, {
                nameChanged: false,
                becomesDefault: false,
            })
        ).toEqual({});
    });

    it("compares the color of a part only when the entry states it", () => {
        const entry = {
            ...base,
            slot: "hair",
            preview: png,
        } as unknown as SeedAvatarPart;
        const current = { name: "New", colorKey: "red", colorHex: "#f00" };
        expect(diffAvatarPart(entry, current).colorChanged).toBe(false);
        const stated = { ...entry, colorKey: "red", colorHex: "#00f" };
        const changes = diffAvatarPart(stated, current);
        expect(changes).toEqual({ nameChanged: false, colorChanged: true });
        expect(buildPartUpdateBody(stated, changes)).toEqual({
            colorKey: "red",
            colorHex: "#00f",
        });
    });
});

describe("diffTileset", () => {
    const current = { name: "n", margin: 1, spacing: 2, tileMeta: { a: 1 } };
    const entry = { key: "k", name: "n", image: png } as never;

    it("leaves out fields the entry does not state", () => {
        expect(diffTileset(entry, current)).toEqual({
            gridChanged: false,
            metaChanged: false,
            nameChanged: false,
        });
    });

    it("sees a grid, meta and name change", () => {
        const changed = {
            ...(entry as object),
            name: "m",
            margin: 3,
            tileMeta: { a: 2 },
        } as never;
        expect(diffTileset(changed, current)).toEqual({
            gridChanged: true,
            metaChanged: true,
            nameChanged: true,
        });
    });
});

describe("update bodies of assets", () => {
    it("strips undefined fields", () => {
        expect(stripUndefined({ a: 1, b: undefined })).toEqual({ a: 1 });
    });

    it("keeps only the fields the asset states", () => {
        const entry = {
            key: "k",
            name: "Tree",
            solid: true,
            image: png,
        } as SeedAsset;
        expect(buildAssetUpdateBody(entry, "decor" as never)).toEqual({
            name: "Tree",
            category: "decor",
            solid: true,
        });
    });
});

describe("pickCreatedVariation", () => {
    const row = (id: string, basePartId: string | null, colorKey: string) =>
        ({ id, key: id, basePartId, colorKey }) as AvatarPart["variations"][0];
    const family = {
        ...row("hair", null, "black"),
        variations: [
            row("hair", null, "black"),
            row("hair-red", "hair", "red"),
        ],
    } as AvatarPart;

    it("finds the row of the color, never the base", () => {
        expect(pickCreatedVariation(family, "red")?.id).toBe("hair-red");
        expect(pickCreatedVariation(family, "black")).toBeUndefined();
    });

    it("is undefined when the family has no such color", () => {
        expect(pickCreatedVariation(family, "blue")).toBeUndefined();
    });
});
