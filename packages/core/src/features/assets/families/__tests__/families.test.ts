import { describe, expect, it } from "vitest";
import {
    ASSET_CATEGORIES,
    ASSET_TYPES,
    LIBRARY_FAMILY_SORTS,
} from "@standin/contracts";
import type {
    LibraryAsset,
    LibraryFamilyQuerySchemaType,
} from "@standin/contracts";
import { assetRow } from "../../utils/__tests__/fixtures";
import { buildAssetDefinition } from "../../utils/buildAssetDefinition";
import { buildFacets, matchesQuery } from "../filterFamilies";
import type { FamilySource } from "../loadFamilySources";
import { sortFamilies } from "../sortFamilies";
import { toFamilySummary } from "../toFamilySummary";

const asset = (
    overrides: Parameters<typeof assetRow>[0] = {}
): LibraryAsset => ({
    ...buildAssetDefinition(assetRow(overrides), "/p/x.png"),
    inUse: false,
    parts: [],
});

const mugBase = asset();
const mugBlue = asset({
    id: "mug-blue",
    baseAssetId: "mug-red",
    colorKey: "blue",
    colorHex: "#3F6FD1",
});
const mugSource: FamilySource = {
    familyId: "mug-red",
    base: mugBase,
    rows: [mugBase, mugBlue],
    inUse: true,
};

const deskBase = asset({
    id: "desk",
    key: "desk",
    name: "Mesa",
    type: ASSET_TYPES.DESK,
    category: ASSET_CATEGORIES.TABLES,
    colorKey: null,
    colorHex: null,
    animation: { frameCount: 3, frameDurationMs: 100, repeat: -1 },
    spriteW: 192,
});
const deskSource: FamilySource = {
    familyId: "desk",
    base: deskBase,
    rows: [deskBase],
    inUse: false,
};

const query = (
    overrides: Partial<LibraryFamilyQuerySchemaType> = {}
): LibraryFamilyQuerySchemaType => ({
    sort: LIBRARY_FAMILY_SORTS.NAME,
    page: 1,
    pageSize: 24,
    ...overrides,
});

describe("toFamilySummary", () => {
    it("represents the family by its base and counts the rows", () => {
        const summary = toFamilySummary(mugSource);

        expect(summary).toMatchObject({
            familyId: "mug-red",
            key: "mug-red",
            variantCount: 2,
            colorCount: 2,
            rotationCount: 0,
            inUse: true,
            hasParts: false,
            thumbnail: { url: "/p/x.png", frameCount: 1 },
        });
    });

    it("reports the frame count of an animated base in the thumbnail", () => {
        expect(toFamilySummary(deskSource).thumbnail.frameCount).toBe(3);
    });
});

describe("matchesQuery, sortFamilies and buildFacets", () => {
    const summaries = [mugSource, deskSource].map(toFamilySummary);

    it("filters by search, type, category and usage", () => {
        const [mug, desk] = summaries as [
            (typeof summaries)[number],
            (typeof summaries)[number],
        ];

        expect(matchesQuery(mug, query({ search: "canec" }))).toBe(true);
        expect(matchesQuery(desk, query({ search: "canec" }))).toBe(false);
        expect(matchesQuery(desk, query({ type: ASSET_TYPES.DESK }))).toBe(
            true
        );
        expect(
            matchesQuery(mug, query({ category: ASSET_CATEGORIES.TABLES }))
        ).toBe(false);
        expect(matchesQuery(mug, query({ inUse: true }))).toBe(true);
    });

    it("sorts by name or type", () => {
        expect(
            sortFamilies(summaries, LIBRARY_FAMILY_SORTS.NAME).map(
                (f) => f.name
            )
        ).toEqual(["Caneca", "Mesa"]);
        expect(
            sortFamilies(summaries, LIBRARY_FAMILY_SORTS.TYPE).map(
                (f) => f.type
            )
        ).toEqual([ASSET_TYPES.DECORATION, ASSET_TYPES.DESK]);
    });

    it("counts the facets and lists the values with no family at zero", () => {
        const facets = buildFacets(summaries);

        expect(facets.usage).toEqual(
            [
                { value: "true", label: "Em uso", count: 1 },
                { value: "false", label: "Livre", count: 1 },
            ].sort((a, b) => a.label.localeCompare(b.label))
        );
        expect(facets.types.find(({ value }) => value === "CHAIR")?.count).toBe(
            0
        );
        expect(facets.categories.map(({ value }) => value)).toEqual([
            ASSET_CATEGORIES.TABLES,
            ASSET_CATEGORIES.FOOD_DRINK,
        ]);
    });
});
