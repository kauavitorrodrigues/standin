import { describe, expect, it } from "vitest";
import { generateBlankLayout } from "../generateBlankLayout";
import { validateLayout } from "../validateLayout";
import { resolveBlankDefaults } from "../blankDefaults";
import { LAYOUT_ISSUE_CODES } from "../issues";
import { SIZE_TIERS } from "../../consts/size-tiers";
import { defaults, library, FLOOR_IMAGE_ID, WALL_IMAGE_ID } from "./fixtures";

const getLayer = (
    layout: ReturnType<typeof generateBlankLayout>,
    name: string
) => layout.layers.find((layer) => layer.name === name)!;

describe("generateBlankLayout", () => {
    it.each(["XS", "S"] as const)("generates a valid %s map", (tier) => {
        const layout = generateBlankLayout(tier, defaults);

        expect(layout.width).toBe(SIZE_TIERS[tier].maxWidth);
        expect(layout.height).toBe(SIZE_TIERS[tier].maxHeight);
        expect(
            validateLayout(layout, library, {
                level: "creation",
                sizeTier: tier,
            })
        ).toEqual({ errors: [], warnings: [] });
    });

    it("is deterministic", () => {
        expect(generateBlankLayout("S", defaults)).toEqual(
            generateBlankLayout("S", defaults)
        );
    });

    it("fills the ground, walls the perimeter and puts the top above it", () => {
        const layout = generateBlankLayout("XS", defaults);
        const { width, height } = layout;
        const ground = getLayer(layout, "ground");
        const walls = getLayer(layout, "walls");
        const foreground = getLayer(layout, "foreground");

        if (ground.type !== "tilelayer") throw new Error("expected tile layer");
        if (walls.type !== "tilelayer") throw new Error("expected tile layer");
        if (foreground.type !== "tilelayer") {
            throw new Error("expected tile layer");
        }

        expect(layout.tilesets).toEqual([
            { name: FLOOR_IMAGE_ID, firstgid: 1 },
            { name: WALL_IMAGE_ID, firstgid: 5 },
        ]);
        expect(ground.data.every((gid) => gid === 1)).toBe(true);
        // Perimeter walls, empty inside.
        expect(walls.data[0]).toBe(5);
        expect(walls.data[width * height - 1]).toBe(5);
        expect(walls.data[width + 1]).toBe(0);
        // The top (local 1 => gid 6) sits on the row above the perimeter, and
        // the top row has no row above it.
        expect(foreground.data[(height - 2) * width + 3]).toBe(6);
        expect(foreground.data[3]).toBe(0);
    });

    it("is valid without walls", () => {
        const layout = generateBlankLayout("XS", { floor: defaults.floor });
        const walls = getLayer(layout, "walls");

        expect(layout.tilesets).toEqual([
            { name: FLOOR_IMAGE_ID, firstgid: 1 },
        ]);
        expect(
            walls.type === "tilelayer" && walls.data.every((gid) => gid === 0)
        ).toBe(true);
        expect(
            validateLayout(layout, library, {
                level: "complete",
                sizeTier: "XS",
            }).errors
        ).toEqual([]);
    });

    it("puts a spawn in the center cell", () => {
        const layout = generateBlankLayout("XS", defaults);
        const zones = getLayer(layout, "zones");

        if (zones.type !== "objectgroup") throw new Error("expected zones");
        expect(zones.objects).toHaveLength(1);
        expect(zones.objects[0].x).toBe(12 * 32);
        expect(zones.objects[0].y).toBe(8 * 32);
    });
});

describe("resolveBlankDefaults", () => {
    const tilesets = Object.values(library.tilesets).filter(
        ({ organizationId }) => organizationId === null
    );

    it("resolves the marked floor and wall", () => {
        const { defaults: resolved, errors } = resolveBlankDefaults(tilesets);

        expect(errors).toEqual([]);
        expect(resolved?.floor).toMatchObject({
            tilesetId: FLOOR_IMAGE_ID,
            tileIndex: 0,
        });
        expect(resolved?.wall).toMatchObject({
            tilesetId: WALL_IMAGE_ID,
            top: 1,
        });
    });

    it("fails without a default floor", () => {
        const { errors } = resolveBlankDefaults([tilesets[1]]);

        expect(errors.map(({ code }) => code)).toEqual([
            LAYOUT_ISSUE_CODES.BLANK_DEFAULT_FLOOR_MISSING,
        ]);
    });

    it("works without a default wall", () => {
        const { defaults: resolved, errors } = resolveBlankDefaults([
            tilesets[0],
        ]);

        expect(errors).toEqual([]);
        expect(resolved?.wall).toBeUndefined();
    });

    it("refuses two defaults of the same category", () => {
        const twoFloors = [
            tilesets[0],
            {
                id: "other-floor",
                tileCount: 2,
                tileMeta: {
                    "0": { category: "FLOOR" as const, blankDefault: true },
                },
            },
        ];

        expect(
            resolveBlankDefaults(twoFloors).errors.map(({ code }) => code)
        ).toEqual([LAYOUT_ISSUE_CODES.BLANK_DEFAULT_DUPLICATED]);
    });
});
