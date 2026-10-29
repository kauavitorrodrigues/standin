import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
    AVATAR_SHEET_PX,
    LibrarySeedEntryError,
    LibrarySeedReferenceNotFoundError,
} from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Runs the library seed against a real Postgres: every new entity type is
// created, left alone by a second run, and updated when a field changes. Off
// unless INTEGRATION_DATABASE_URL points at a throwaway database different
// from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Seed = import("@standin/core").LibrarySeed;
type Result = import("@standin/core").LibrarySeedResult;

type Variant = {
    areaName: string;
    areaShade: number;
    tableOffsetY: number;
    partName: string;
    partShade: number;
    variationHex: string;
    baseName: string;
};

const FIRST: Variant = {
    areaName: "Lobby",
    areaShade: 10,
    tableOffsetY: 1,
    partName: "Short hair",
    partShade: 20,
    variationHex: "#B03A2E",
    baseName: "Body",
};

describe.skipIf(!enabled)("library seed (real database)", () => {
    let core: Core;
    let adminId: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const key = (name: string) => `${name}-${RUN}`;
    const seed = (seeded: Seed) =>
        core.AssetService.seed(seeded, { createdBy: adminId });

    const solid = (width: number, height: number, shade: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [
                shade,
                shade,
                shade,
                255,
            ])
        );
    const sheet = (shade: number) =>
        solid(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, shade);

    const stamp = (tilesetKey: string, assetKey: string) => ({
        version: 1 as const,
        width: 2,
        height: 2,
        palette: [{ tilesetKey, tileIndex: 0 }],
        layers: { ground: [1, 1, 1, 1] },
        objects: [
            {
                assetKey,
                dx: 0,
                dy: 0,
                offsetX: 0,
                offsetY: 0,
                parentIndex: null,
            },
        ],
        zone: null,
    });

    const build = (variant: Variant = FIRST): Seed => ({
        tilesets: [
            {
                key: key("floor"),
                name: "Floor",
                tileMeta: { "0": { category: "FLOOR" } },
                image: solid(32, 32, 50),
            },
        ],
        assets: [
            {
                key: key("chair"),
                name: "Chair",
                type: "CHAIR",
                footprint: { w: 1, h: 1 },
                image: solid(32, 32, 60),
            },
            {
                key: key("table"),
                name: "Table",
                type: "TABLE",
                footprint: { w: 1, h: 1 },
                image: solid(32, 32, 70),
            },
        ],
        bundles: [
            {
                asset: key("table"),
                parts: [
                    {
                        partAsset: key("chair"),
                        offsetX: 0,
                        offsetY: variant.tableOffsetY,
                    },
                ],
            },
        ],
        areas: [
            {
                key: key("lobby"),
                name: variant.areaName,
                stamp: stamp(key("floor"), key("table")),
                image: solid(64, 64, variant.areaShade),
            },
        ],
        avatarBases: [
            {
                key: key("body"),
                name: variant.baseName,
                isDefault: false,
                image: sheet(90),
                preview: solid(24, 24, 120),
            },
        ],
        avatarParts: [
            {
                key: key("hair"),
                name: variant.partName,
                slot: "HAIR",
                colorKey: "black",
                colorHex: "#1A1A1A",
                image: sheet(variant.partShade),
                preview: solid(24, 24, 130),
                variations: [
                    {
                        colorKey: "red",
                        colorHex: variant.variationHex,
                        image: sheet(30),
                        preview: solid(24, 24, 140),
                    },
                ],
            },
        ],
    });

    const actions = (items: Result[keyof Result]) =>
        items.map(({ action }) => action);
    const everyAction = (result: Result) => ({
        tilesets: actions(result.tilesets),
        assets: actions(result.assets),
        bundles: actions(result.bundles),
        areas: actions(result.areas),
        avatarBases: actions(result.avatarBases),
        avatarParts: actions(result.avatarParts),
    });
    const only = (group: keyof Result, action: string) =>
        expect(everyAction(lastResult)[group]).toEqual(
            Array.from({ length: lastResult[group].length }, () => action)
        );
    let lastResult: Result;
    const run = async (variant: Variant) => {
        lastResult = await seed(build(variant));
        return lastResult;
    };

    const catchError = async (work: Promise<unknown>) => {
        try {
            await work;
        } catch (error) {
            return error;
        }
        return null;
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        const { db, usersTable } = await import("@standin/database");
        const [admin] = await db
            .insert(usersTable)
            .values({
                name: "seed-admin",
                email: `seed-admin-${RUN}@library-seed.dev`,
                password: "x",
                role: "ADMIN",
            })
            .returning({ id: usersTable.id });
        adminId = admin!.id;
    });

    afterAll(() => {
        process.chdir(os.tmpdir());
    });

    describe("a full library", () => {
        it("creates every entity the first time", async () => {
            const result = await run(FIRST);

            expect(everyAction(result)).toEqual({
                tilesets: ["create"],
                assets: ["create", "create"],
                bundles: ["create"],
                areas: ["create"],
                avatarBases: ["create"],
                avatarParts: ["create", "create"],
            });
            expect(result.avatarParts.map(({ key }) => key)).toEqual([
                key("hair"),
                `${key("hair")}-red`,
            ]);
        });

        it("reports every entry as unchanged the second time", async () => {
            await run(FIRST);

            for (const group of [
                "tilesets",
                "assets",
                "bundles",
                "areas",
                "avatarBases",
                "avatarParts",
            ] as const) {
                only(group, "unchanged");
            }
        });

        it("updates only the group whose field changed", async () => {
            await run({ ...FIRST, areaName: "Lobby 2" });
            only("areas", "update");
            only("avatarParts", "unchanged");
            await run({ ...FIRST, areaName: "Lobby 2" });
            only("areas", "unchanged");

            await run({ ...FIRST, areaName: "Lobby 2", areaShade: 11 });
            only("areas", "update");
            await run({ ...FIRST, areaName: "Lobby 2", areaShade: 11 });
            only("areas", "unchanged");
        });

        it("updates a bundle when an offset changes", async () => {
            const variant = { ...FIRST, areaName: "Lobby 2", areaShade: 11 };
            await run({ ...variant, tableOffsetY: 2 });
            only("bundles", "update");
            await run({ ...variant, tableOffsetY: 2 });
            only("bundles", "unchanged");
        });

        it("updates avatar parts, variations and bases", async () => {
            const variant = {
                ...FIRST,
                areaName: "Lobby 2",
                areaShade: 11,
                tableOffsetY: 2,
            };
            await run({ ...variant, partName: "Long hair" });
            expect(actions(lastResult.avatarParts)).toEqual([
                "update",
                "unchanged",
            ]);

            const sheetChange = { ...variant, partName: "Long hair" };
            await run({ ...sheetChange, partShade: 21 });
            expect(actions(lastResult.avatarParts)).toEqual([
                "update",
                "unchanged",
            ]);

            await run({
                ...sheetChange,
                partShade: 21,
                variationHex: "#C03A2E",
            });
            expect(actions(lastResult.avatarParts)).toEqual([
                "unchanged",
                "update",
            ]);

            await run({
                ...sheetChange,
                partShade: 21,
                variationHex: "#C03A2E",
                baseName: "Body 2",
            });
            only("avatarBases", "update");

            await run({
                ...sheetChange,
                partShade: 21,
                variationHex: "#C03A2E",
                baseName: "Body 2",
            });
            for (const group of ["avatarBases", "avatarParts"] as const) {
                only(group, "unchanged");
            }
        });
    });

    describe("old files", () => {
        it("accepts a seed with only tilesets and assets", async () => {
            const { tilesets, assets } = build();

            const result = await seed({ tilesets, assets });

            expect(result.bundles).toEqual([]);
            expect(result.areas).toEqual([]);
            expect(result.avatarBases).toEqual([]);
            expect(result.avatarParts).toEqual([]);
            expect(actions(result.tilesets)).toEqual(["unchanged"]);
        });

        it("does not compare what an entry leaves out", async () => {
            const full = build();
            const base = full.avatarBases![0]!;
            const { preview: _preview, isDefault: _default, ...bare } = base;

            const result = await seed({
                tilesets: [],
                assets: [],
                avatarBases: [{ ...bare, name: "Body 2" }],
            });

            expect(actions(result.avatarBases)).toEqual(["unchanged"]);
        });
    });

    describe("references", () => {
        it("lists every unknown key of an area", async () => {
            const [area] = build().areas!;
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    areas: [
                        {
                            ...area!,
                            key: key("broken"),
                            stamp: stamp("no-such-tileset", "no-such-asset"),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedReferenceNotFoundError);
            const { entry, references } =
                error as LibrarySeedReferenceNotFoundError;
            expect(entry).toBe(`areas "${key("broken")}"`);
            expect(references).toEqual([
                {
                    field: "stamp.palette[0].tilesetKey",
                    key: "no-such-tileset",
                },
                { field: "stamp.objects[0].assetKey", key: "no-such-asset" },
            ]);
        });

        it("fails a bundle whose root or part is unknown", async () => {
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    bundles: [
                        {
                            asset: "no-such-root",
                            parts: [
                                {
                                    partAsset: "no-such-part",
                                    offsetX: 0,
                                    offsetY: 0,
                                },
                            ],
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedReferenceNotFoundError);
            expect(
                (error as LibrarySeedReferenceNotFoundError).references
            ).toEqual([
                { field: "asset", key: "no-such-root" },
                { field: "parts[0].partAsset", key: "no-such-part" },
            ]);
        });
    });

    describe("validation of the services", () => {
        it("names the avatar part whose sheet has the wrong size", async () => {
            const [part] = build().avatarParts!;
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarParts: [
                        {
                            ...part!,
                            key: key("bad-sheet"),
                            variations: [],
                            image: solid(2303, 64, 5),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect((error as LibrarySeedEntryError).code).toBe(
                "AVATAR_SHEET_INVALID_SIZE"
            );
            expect((error as Error).message).toContain(
                `avatarParts "${key("bad-sheet")}"`
            );
        });

        it("names the avatar base whose sheet is not an avatar sheet", async () => {
            const [base] = build().avatarBases!;
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarBases: [
                        {
                            ...base!,
                            key: key("bad-base"),
                            image: solid(32, 32, 5),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect((error as Error).message).toContain(
                `avatarBases "${key("bad-base")}"`
            );
        });

        it("names the area whose image does not match the stamp", async () => {
            const [area] = build().areas!;
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    areas: [
                        {
                            ...area!,
                            key: key("bad-area"),
                            image: solid(32, 32, 5),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            const { issues, message } = error as LibrarySeedEntryError;
            expect(issues.map(({ code }) => code)).toEqual([
                "THUMBNAIL_SIZE_MISMATCH",
            ]);
            expect(message).toContain(`areas "${key("bad-area")}"`);
        });

        it("refuses to move a part to another slot", async () => {
            const [part] = build().avatarParts!;
            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarParts: [{ ...part!, slot: "HAT", variations: [] }],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect((error as LibrarySeedEntryError).code).toBe(
                "LIBRARY_SEED_AVATAR_SLOT_CHANGED"
            );
        });
    });

    describe("a refused image leaves the entry intact", () => {
        const storedBase = async (baseKey: string) => {
            const { db, avatarBasesTable, eq } =
                await import("@standin/database");
            const [row] = await db
                .select({
                    name: avatarBasesTable.name,
                    fileId: avatarBasesTable.fileId,
                    previewFileId: avatarBasesTable.previewFileId,
                })
                .from(avatarBasesTable)
                .where(eq(avatarBasesTable.key, baseKey));
            return row!;
        };
        const storedPart = async (partKey: string) => {
            const { db, avatarPartsTable, eq } =
                await import("@standin/database");
            const [row] = await db
                .select({
                    name: avatarPartsTable.name,
                    fileId: avatarPartsTable.fileId,
                    previewFileId: avatarPartsTable.previewFileId,
                })
                .from(avatarPartsTable)
                .where(eq(avatarPartsTable.key, partKey));
            return row!;
        };

        it("keeps the name of a base whose new sheet is refused", async () => {
            const [base] = build().avatarBases!;
            const entry = { ...base!, key: key("guard-body"), name: "Guard" };
            await seed({ tilesets: [], assets: [], avatarBases: [entry] });
            const before = await storedBase(key("guard-body"));

            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarBases: [
                        { ...entry, name: "Renamed", image: solid(32, 32, 5) },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect(await storedBase(key("guard-body"))).toEqual(before);
        });

        it("keeps the sheet of a base whose new preview is refused", async () => {
            const [base] = build().avatarBases!;
            const entry = { ...base!, key: key("guard-preview") };
            await seed({ tilesets: [], assets: [], avatarBases: [entry] });
            const before = await storedBase(key("guard-preview"));

            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarBases: [
                        {
                            ...entry,
                            name: "Renamed",
                            image: sheet(95),
                            preview: Buffer.from("not a png"),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect(await storedBase(key("guard-preview"))).toEqual(before);
        });

        it("keeps the name and the sheet of a part whose new preview is refused", async () => {
            const [part] = build().avatarParts!;
            const entry = {
                ...part!,
                key: key("guard-hair"),
                variations: [],
            };
            await seed({ tilesets: [], assets: [], avatarParts: [entry] });
            const before = await storedPart(key("guard-hair"));

            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarParts: [
                        {
                            ...entry,
                            name: "Renamed",
                            image: sheet(77),
                            preview: Buffer.from("not a png"),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect(await storedPart(key("guard-hair"))).toEqual(before);
        });

        it("keeps the name of a part whose new sheet is refused", async () => {
            const [part] = build().avatarParts!;
            const entry = { ...part!, key: key("guard-sheet"), variations: [] };
            await seed({ tilesets: [], assets: [], avatarParts: [entry] });
            const before = await storedPart(key("guard-sheet"));

            const error = await catchError(
                seed({
                    tilesets: [],
                    assets: [],
                    avatarParts: [
                        {
                            ...entry,
                            name: "Renamed again",
                            image: solid(2303, 64, 5),
                        },
                    ],
                })
            );

            expect(error).toBeInstanceOf(LibrarySeedEntryError);
            expect(await storedPart(key("guard-sheet"))).toEqual(before);
        });
    });

    describe("area keys", () => {
        it("allows many areas without a key and refuses a repeated key", async () => {
            const [area] = build().areas!;
            const { db, areasTable, eq } = await import("@standin/database");
            const [seeded] = await db
                .select({ stamp: areasTable.stamp })
                .from(areasTable)
                .where(eq(areasTable.key, key("lobby")));
            const resolved = { name: "Keyless", stamp: seeded!.stamp };
            const context = { organizationId: null, createdBy: adminId };
            const image = { buffer: area!.image };

            await core.AreaService.create(image, resolved, context);
            await core.AreaService.create(image, resolved, context);
            await core.AreaService.create(image, resolved, context, key("one"));
            const repeated = await catchError(
                core.AreaService.create(image, resolved, context, key("one"))
            );

            expect(repeated).not.toBeNull();
        });
    });

    describe("library folder", () => {
        const folderWith = (library: object) => {
            const folder = fs.mkdtempSync(path.join(os.tmpdir(), "library-"));
            fs.writeFileSync(path.join(folder, "area.png"), solid(64, 64, 1));
            fs.writeFileSync(
                path.join(folder, "library.json"),
                JSON.stringify(library)
            );
            return folder;
        };

        it("refuses a key written twice and a bundle part written twice", async () => {
            const { readLibraryFolder } =
                await import("@/scripts/utils/readLibraryFolder");
            const area = {
                key: key("twice"),
                name: "Twice",
                file: "area.png",
                stamp: stamp("a", "b"),
            };
            const part = { partAsset: "chair", offsetX: 0, offsetY: 1 };

            await expect(
                readLibraryFolder(folderWith({ areas: [area, area] }))
            ).rejects.toThrow(/written twice in areas/);
            await expect(
                readLibraryFolder(
                    folderWith({
                        bundles: [{ asset: "table", parts: [part, part] }],
                    })
                )
            ).rejects.toThrow(/lists the part .+chair.+twice/);
        });

        it("reads library.json and its PNGs and seeds them twice", async () => {
            const { readLibraryFolder } =
                await import("@/scripts/utils/readLibraryFolder");
            const folder = fs.mkdtempSync(path.join(os.tmpdir(), "library-"));
            const write = (name: string, png: Buffer) =>
                fs.writeFileSync(path.join(folder, name), png);
            write("floor.png", solid(32, 32, 51));
            write("chair.png", solid(32, 32, 61));
            write("table.png", solid(32, 32, 71));
            write("lobby.png", solid(64, 64, 12));
            write("body.png", sheet(91));
            write("hair.png", sheet(21));
            write("hair-red.png", sheet(31));
            write("preview.png", solid(24, 24, 100));
            const name = (value: string) => `${value}-folder-${RUN}`;
            fs.writeFileSync(
                path.join(folder, "library.json"),
                JSON.stringify({
                    tilesets: [
                        {
                            key: name("floor"),
                            name: "Floor",
                            file: "floor.png",
                            tileMeta: { "0": { category: "FLOOR" } },
                        },
                    ],
                    assets: [
                        {
                            key: name("chair"),
                            name: "Chair",
                            type: "CHAIR",
                            footprint: { w: 1, h: 1 },
                            file: "chair.png",
                        },
                        {
                            key: name("table"),
                            name: "Table",
                            type: "TABLE",
                            footprint: { w: 1, h: 1 },
                            file: "table.png",
                        },
                    ],
                    bundles: [
                        {
                            asset: name("table"),
                            parts: [
                                {
                                    partAsset: name("chair"),
                                    offsetX: 0,
                                    offsetY: 1,
                                },
                            ],
                        },
                    ],
                    areas: [
                        {
                            key: name("lobby"),
                            name: "Lobby",
                            file: "lobby.png",
                            stamp: stamp(name("floor"), name("table")),
                        },
                    ],
                    avatarBases: [
                        { key: name("body"), name: "Body", file: "body.png" },
                    ],
                    avatarParts: [
                        {
                            key: name("hair"),
                            name: "Hair",
                            slot: "HAIR",
                            colorKey: "black",
                            colorHex: "#1A1A1A",
                            file: "hair.png",
                            preview: "preview.png",
                            variations: [
                                {
                                    colorKey: "red",
                                    colorHex: "#B03A2E",
                                    file: "hair-red.png",
                                    preview: "preview.png",
                                },
                            ],
                        },
                    ],
                })
            );

            const first = await seed(await readLibraryFolder(folder));
            const second = await seed(await readLibraryFolder(folder));

            expect(first.areas.map(({ action }) => action)).toEqual(["create"]);
            expect(first.avatarParts).toHaveLength(2);
            const secondActions = Object.values(second).flatMap((items) =>
                items.map(({ action }) => action)
            );
            expect(new Set(secondActions)).toEqual(new Set(["unchanged"]));
        });
    });
});
