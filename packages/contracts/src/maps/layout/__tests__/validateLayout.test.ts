import { describe, expect, it } from "vitest";
import {
    MAX_OBJECTS_PER_MAP,
    MAX_TILESETS_PER_MAP,
    MAX_ZONES_PER_MAP,
} from "../../consts/constants";
import type { MapLayout } from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_CODES as Code, type LayoutIssueCode } from "../issues";
import { validateLayout } from "../validateLayout";
import type { ValidateLayoutContext } from "../types/validate-context";
import { zoneToObject } from "../zone";
import { buildLayout, library, FLOOR_IMAGE_ID } from "./fixtures";

const complete: ValidateLayoutContext = { level: "complete", sizeTier: "XS" };

const getZones = (layout: MapLayout) => {
    const group = layout.layers.find((layer) => layer.type === "objectgroup");
    if (!group || group.type !== "objectgroup") throw new Error("no zones");
    return group;
};

const getGround = (layout: MapLayout) => {
    const ground = layout.layers.find((layer) => layer.name === "ground");
    if (!ground || ground.type !== "tilelayer") throw new Error("no ground");
    return ground;
};

const area = (id: number, extra = {}) =>
    zoneToObject(
        {
            kind: "area",
            label: "Sala",
            x: 0,
            y: 0,
            width: 64,
            height: 64,
            ...extra,
        },
        id
    );

type Case = {
    code: LayoutIssueCode;
    severity: "errors" | "warnings";
    context?: ValidateLayoutContext;
    mutate: (layout: MapLayout) => void;
};

const cases: Case[] = [
    {
        code: Code.MAP_NOT_ORTHOGONAL,
        severity: "errors",
        mutate: (l) =>
            ((l as { orientation: string }).orientation = "isometric"),
    },
    {
        code: Code.MAP_INFINITE,
        severity: "errors",
        mutate: (l) => ((l as { infinite: boolean }).infinite = true),
    },
    {
        code: Code.TILE_SIZE_MISMATCH,
        severity: "errors",
        mutate: (l) => ((l as { tilewidth: number }).tilewidth = 16),
    },
    {
        code: Code.MAP_TOO_LARGE_GLOBAL,
        severity: "errors",
        mutate: (l) => (l.width = 101),
    },
    {
        code: Code.MAP_TOO_SMALL,
        severity: "errors",
        mutate: (l) => (l.width = 10),
    },
    {
        code: Code.TIER_DIMENSION_EXCEEDED,
        severity: "errors",
        context: { level: "complete", sizeTier: "XS" },
        mutate: (l) => (l.width = 25),
    },
    {
        code: Code.NO_TILE_LAYER,
        severity: "errors",
        mutate: (l) => (getGround(l).name = "floor"),
    },
    {
        code: Code.LAYER_DIMENSION_MISMATCH,
        severity: "errors",
        mutate: (l) => (getGround(l).width = 10),
    },
    {
        code: Code.LAYER_DATA_LENGTH,
        severity: "errors",
        mutate: (l) => getGround(l).data.pop(),
    },
    {
        code: Code.GID_OUT_OF_RANGE,
        severity: "errors",
        mutate: (l) => (getGround(l).data[0] = 999),
    },
    {
        code: Code.TILESET_NOT_IN_LIBRARY,
        severity: "errors",
        mutate: (l) => l.tilesets.push({ name: "missing", firstgid: 9 }),
    },
    {
        code: Code.TOO_MANY_TILESETS,
        severity: "warnings",
        mutate: (l) => {
            for (let i = 0; i <= MAX_TILESETS_PER_MAP; i++) {
                l.tilesets.push({ name: FLOOR_IMAGE_ID, firstgid: 100 + i });
            }
        },
    },
    {
        code: Code.TOO_MANY_OBJECTS,
        severity: "errors",
        context: { ...complete, objectCount: MAX_OBJECTS_PER_MAP + 1 },
        mutate: () => undefined,
    },
    {
        code: Code.ZONE_KIND_INVALID,
        severity: "errors",
        mutate: (l) =>
            getZones(l).objects.push(area(10, { kind: "teleporter" })),
    },
    {
        code: Code.ZONE_LABEL_REQUIRED,
        severity: "errors",
        mutate: (l) => getZones(l).objects.push(area(10, { label: undefined })),
    },
    {
        code: Code.ZONE_KEY_REQUIRED,
        severity: "errors",
        mutate: (l) =>
            getZones(l).objects.push(
                area(10, { kind: "private", label: "Sala" })
            ),
    },
    {
        code: Code.ZONE_KEY_DUPLICATED,
        severity: "errors",
        mutate: (l) => {
            getZones(l).objects.push(area(10, { key: "a" }));
            getZones(l).objects.push(area(11, { key: "a" }));
        },
    },
    {
        code: Code.ZONE_POLYGON_INVALID,
        severity: "errors",
        mutate: (l) =>
            getZones(l).objects.push(
                area(10, {
                    polygon: [
                        { x: 0, y: 0 },
                        { x: 5, y: 5 },
                    ],
                })
            ),
    },
    {
        code: Code.ZONE_ROTATED,
        severity: "errors",
        mutate: (l) => getZones(l).objects.push(area(10, { rotation: 45 })),
    },
    {
        code: Code.TOO_MANY_ZONES,
        severity: "errors",
        mutate: (l) => {
            for (let i = 0; i <= MAX_ZONES_PER_MAP; i++) {
                getZones(l).objects.push(area(100 + i));
            }
        },
    },
    {
        code: Code.SPAWN_MISSING,
        severity: "errors",
        mutate: (l) => (getZones(l).objects = []),
    },
    {
        code: Code.SPAWN_TOO_CLOSE,
        severity: "warnings",
        mutate: (l) =>
            getZones(l).objects.push(
                zoneToObject(
                    {
                        kind: "spawn",
                        x: 12 * 32 + 32,
                        y: 8 * 32,
                        width: 32,
                        height: 32,
                    },
                    10
                )
            ),
    },
    {
        code: Code.LAYOUT_TOO_LARGE,
        severity: "errors",
        context: { level: "light", sizeTier: "XS" },
        mutate: (l) => (l.backgroundcolor = "x".repeat(1024 * 1024 + 1)),
    },
];

describe("validateLayout", () => {
    it("accepts a freshly generated layout", () => {
        expect(validateLayout(buildLayout(), library, complete)).toEqual({
            errors: [],
            warnings: [],
        });
    });

    it.each(cases)("reports $code as $severity", (testCase) => {
        const layout = buildLayout();
        testCase.mutate(layout);

        const result = validateLayout(
            layout,
            library,
            testCase.context ?? complete
        );

        expect(result[testCase.severity].map(({ code }) => code)).toContain(
            testCase.code
        );
    });

    it("masks the flip bits of a gid", () => {
        const layout = buildLayout();
        getGround(layout).data[0] = 0x80000000 + 1;

        expect(validateLayout(layout, library, complete).errors).toEqual([]);
    });

    it("only runs the cheap checks at the light level", () => {
        const layout = buildLayout();
        getZones(layout).objects = [];

        expect(
            validateLayout(layout, library, { level: "light" }).errors
        ).toEqual([]);
    });
});
