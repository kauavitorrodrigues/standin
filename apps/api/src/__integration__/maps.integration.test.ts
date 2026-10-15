import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";
import { publishOps, publishRaw } from "./helpers/publishOps";

// Runs the map flows against a real Postgres. Off by default: point
// INTEGRATION_DATABASE_URL at a throwaway database (migrated, empty) to run.
// It must differ from the DATABASE_URL of the app, so a dev database is never
// touched by accident.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");

describe.skipIf(!enabled)("maps flows (real database)", () => {
    let core: Core;
    let database: Database;
    // Shared by the integration files: they share the database, and so the
    // global library whose files this directory holds.
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<
        "admin" | "owner" | "member" | "other" | "outsider",
        { id: string; role: "ADMIN" | "USER" }
    >;
    let organizationId: string;
    let floorTilesetId: string;
    let wallTilesetId: string;
    const defs = {} as Record<string, string>;
    let space: { id: string; mapId: string };
    let privateAssetId: string;

    const asUser = (key: keyof typeof users) => users[key];
    const accessOf = (key: keyof typeof users, mapId: string) =>
        core.MapService.getAccess(asUser(key), mapId);

    // Layout changes go through the publication, as the editor does.
    const publishAs = async (
        key: keyof typeof users,
        mapId: string,
        baseVersion: number,
        ops: EditorOp[]
    ) =>
        publishOps(
            core,
            { id: users[key].id, name: key },
            await accessOf(key, mapId),
            baseVersion,
            ops
        );

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        // Files go to a temp dir instead of apps/api/public.
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { db, usersTable, organizationMembersTable } = database;

        const make = async (
            key: keyof typeof users,
            role: "ADMIN" | "USER"
        ) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@verify.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");
        await make("other", "USER");
        await make("outsider", "USER");

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Verify Org" }
        );
        organizationId = organization.id;
        for (const key of ["member", "other"] as const) {
            await db.insert(organizationMembersTable).values({
                userId: users[key].id,
                organizationId,
                role: "MEMBER",
            });
        }
    });

    describe("library seed", () => {
        // The default pieces are left out: the tests below create their own,
        // with keys that cannot collide on a shared database.
        const tilesetsSeed = () => ({
            tilesets: core.DEFAULT_LIBRARY_SEED.tilesets,
            assets: [],
        });

        it("creates the tilesets once, then leaves them unchanged", async () => {
            const first = await core.AssetService.seed(tilesetsSeed(), {
                createdBy: users.admin.id,
            });
            const second = await core.AssetService.seed(tilesetsSeed(), {
                createdBy: users.admin.id,
            });

            expect(first.tilesets.map(({ key }) => key).sort()).toEqual([
                "floors",
                "walls",
            ]);
            // The library is global, so another run may have created it.
            for (const { action } of first.tilesets) {
                expect(["create", "update", "unchanged"]).toContain(action);
            }
            // The same input again changes nothing, not even the file.
            for (const { action } of second.tilesets) {
                expect(action).toBe("unchanged");
            }

            const { db, tilesetsTable, isNull } = database;
            const tilesets = await db
                .select()
                .from(tilesetsTable)
                .where(isNull(tilesetsTable.organizationId));
            floorTilesetId = tilesets.find(({ key }) => key === "floors")!.id;
            wallTilesetId = tilesets.find(({ key }) => key === "walls")!.id;
            expect(tilesets.filter(({ key }) => key === "floors")).toHaveLength(
                1
            );
        });

        it("seeds the placeable pieces used by the next tests", async () => {
            const { db, assetsTable } = database;
            const create = async (
                key: string,
                data: Partial<import("@standin/contracts").CreateAssetData>,
                size = { w: 32, h: 32 }
            ) => {
                const asset = await core.AssetService.createAsset(
                    {
                        buffer: core.encodePng(
                            size.w,
                            size.h,
                            Array.from({ length: size.w * size.h }, () => [
                                9, 9, 9, 255,
                            ])
                        ),
                    },
                    {
                        key: `${key}-${RUN}`,
                        name: key,
                        type: "DECORATION",
                        category: "ROOM_DECOR",
                        footprint: { w: 1, h: 1 },
                        ...data,
                    },
                    { organizationId: null, createdBy: users.admin.id }
                );
                defs[key] = asset.id;
                return asset.id;
            };

            await create(
                "desk",
                {
                    type: "DESK",
                    footprint: { w: 2, h: 1 },
                    solid: true,
                    surfaceHeightPx: 20,
                },
                { w: 64, h: 32 }
            );
            await create(
                "desk-3",
                { type: "DESK", footprint: { w: 3, h: 1 }, solid: true },
                { w: 96, h: 32 }
            );
            await create(
                "table",
                { type: "TABLE", footprint: { w: 2, h: 1 } },
                { w: 64, h: 32 }
            );
            await create("monitor", { type: "MONITOR", placement: "SURFACE" });
            await create("chair", {
                type: "CHAIR",
                action: "SIT",
                actionParams: { seats: [{ dx: 16, dy: -8, facing: "DOWN" }] },
            });
            await create("poster", { type: "POSTER", placement: "WALL" });
            await create("tree", { type: "TREE", solid: true });
            const bundleId = await create(
                "desk-bundle",
                { type: "DESK", footprint: { w: 2, h: 1 }, solid: true },
                { w: 64, h: 32 }
            );
            await core.AssetService.setParts(bundleId, null, {
                parts: [{ partAssetId: defs.chair, offsetX: 0, offsetY: 1 }],
            });

            // A private piece of the organization, planted straight into the
            // table since the API only writes the global library for now.
            const file = await core.FileService.upload(
                {
                    buffer: core.encodePng(
                        32,
                        32,
                        Array.from({ length: 32 * 32 }, () => [9, 9, 9, 255])
                    ),
                    originalname: "secret.png",
                    mimetype: "image/png",
                    size: 0,
                },
                { folder: "test" }
            );
            const [privateAsset] = await db
                .insert(assetsTable)
                .values({
                    organizationId,
                    fileId: file.id,
                    createdBy: users.admin.id,
                    key: `secret-${RUN}`,
                    name: "secret",
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    spriteW: 32,
                    spriteH: 32,
                })
                .returning({ id: assetsTable.id });
            privateAssetId = privateAsset.id;
        });
    });

    describe("create space", () => {
        it("builds a blank XS space with map and conversation in one go", async () => {
            const created = await core.SpaceService.create(
                organizationId,
                users.owner.id,
                { name: "Sala", sizeTier: "XS" }
            );
            space = { id: created.id, mapId: created.mapId };

            const { db, mapsTable, conversationsTable, and, eq } = database;
            const [map] = await db
                .select()
                .from(mapsTable)
                .where(eq(mapsTable.id, space.mapId));
            const conversations = await db
                .select()
                .from(conversationsTable)
                .where(
                    and(
                        eq(conversationsTable.spaceId, space.id),
                        eq(conversationsTable.type, "SPACE")
                    )
                );

            expect(map).toMatchObject({
                width: 24,
                height: 16,
                tileSize: 32,
                sizeTier: "XS",
                layoutVersion: 1,
            });
            expect(map.layout.tilesets).toEqual([
                { name: floorTilesetId, firstgid: 1 },
                { name: wallTilesetId, firstgid: 5 },
            ]);
            expect(conversations).toHaveLength(1);
        });

        it("answers 422 TIER_DISABLED for a disabled tier", async () => {
            await expect(
                core.SpaceService.create(organizationId, users.owner.id, {
                    name: "Grande",
                    sizeTier: "M",
                })
            ).rejects.toMatchObject({ status: 422, code: "TIER_DISABLED" });
        });

        it("rolls everything back when a step fails", async () => {
            const {
                db,
                mapsTable,
                spacesTable,
                tilesetsTable,
                usersTable,
                eq,
                and,
                inArray,
                isNull,
                count,
            } = database;
            const countRows = async () => ({
                maps: (await db.select({ n: count() }).from(mapsTable))[0].n,
                spaces: (await db.select({ n: count() }).from(spacesTable))[0]
                    .n,
            });

            const before = await countRows();
            // With no default floor the placeholder library is seeded on the
            // spot, so the failure needs the seed out of reach too: no tileset
            // with a default floor and no admin to own a seeded one.
            const globalFloors = await db
                .select({ id: tilesetsTable.id })
                .from(tilesetsTable)
                .where(
                    and(
                        isNull(tilesetsTable.organizationId),
                        isNull(tilesetsTable.deletedAt)
                    )
                );
            const admins = await db
                .select({ id: usersTable.id })
                .from(usersTable)
                .where(eq(usersTable.role, "ADMIN"));
            const setDeleted = (deletedAt: Date | null) =>
                db
                    .update(tilesetsTable)
                    .set({ deletedAt })
                    .where(
                        inArray(
                            tilesetsTable.id,
                            globalFloors.map(({ id }) => id)
                        )
                    );
            const setAdminRole = (role: "ADMIN" | "USER") =>
                db
                    .update(usersTable)
                    .set({ role })
                    .where(
                        inArray(
                            usersTable.id,
                            admins.map(({ id }) => id)
                        )
                    );

            await setDeleted(new Date());
            await setAdminRole("USER");
            try {
                await expect(
                    core.SpaceService.create(organizationId, users.owner.id, {
                        name: "Falha",
                        sizeTier: "XS",
                    })
                ).rejects.toMatchObject({
                    code: "BLANK_DEFAULT_FLOOR_MISSING",
                });
            } finally {
                await setDeleted(null);
                await setAdminRole("ADMIN");
            }

            expect(await countRows()).toEqual(before);
        });
    });

    describe("render payload and access", () => {
        it("serves the completed layout to a member and flags edit for the owner", async () => {
            const owner = await core.MapService.buildRenderPayload(
                await accessOf("owner", space.mapId),
                users.owner.id
            );
            const member = await core.MapService.buildRenderPayload(
                await accessOf("member", space.mapId),
                users.member.id
            );

            expect(owner.access.canEdit).toBe(true);
            expect(member.access.canEdit).toBe(false);
            expect(owner.map.layoutVersion).toBe(1);
            expect(owner.tilesets.map(({ id }) => id).sort()).toEqual(
                [floorTilesetId, wallTilesetId].sort()
            );
            const tilesets = (
                owner.map.layout as {
                    tilesets: { image: string; tiles: unknown[] }[];
                }
            ).tilesets;
            expect(tilesets).toHaveLength(2);
            // Phaser drops the tile properties of a layout without a version.
            expect((owner.map.layout as { version: string }).version).toBe(
                "1.10"
            );
            // The eight pieces of the default wall style each carry a property:
            // solid and top for the tall ones, a collision mask for the sides.
            expect(tilesets[1].tiles).toHaveLength(8);
            expect(owner.desks).toEqual([]);
        });

        it("denies a stranger and denies a member any template map", async () => {
            const stranger = await accessOf("outsider", space.mapId);
            expect(stranger.canRead).toBe(false);

            const template = await core.MapTemplateService.create(
                users.admin.id,
                {
                    name: "Acesso",
                    sizeTier: "XS",
                }
            );
            const owner = await accessOf("owner", template.mapId);
            const admin = await accessOf("admin", template.mapId);

            expect(owner.canRead).toBe(false);
            expect(admin).toMatchObject({ canRead: true, canEdit: true });
        });

        it("exports Tiled JSON from the database", async () => {
            const tiled = (await core.MapService.exportTiled(space.mapId)) as {
                type: string;
                tilesets: { name: string }[];
            };

            expect(tiled.type).toBe("map");
            expect(tiled.tilesets.map(({ name }) => name)).toEqual([
                floorTilesetId,
                wallTilesetId,
            ]);
        });
    });

    describe("layout changes through the publication", () => {
        it("paints, bumps the version, and rejects a stale baseVersion", async () => {
            const applied = await publishAs("owner", space.mapId, 1, [
                {
                    type: "paint",
                    layer: "ground",
                    tilesetId: floorTilesetId,
                    tileIndex: 1,
                    cells: [
                        [3, 3],
                        [4, 3],
                    ],
                },
            ]);
            expect(applied.version).toBe(2);

            await expect(
                publishAs("owner", space.mapId, 1, [
                    { type: "set_background", color: "#101010" },
                ])
            ).rejects.toMatchObject({ status: 409, currentVersion: 2 });
        });

        it("lets only one of two concurrent editors win", async () => {
            const access = await accessOf("owner", space.mapId);
            const actor = { id: users.owner.id, name: "owner" };
            const lock = core.MapLockService.acquire(
                space.mapId,
                actor,
                "integration-publish-session"
            );
            expect(lock.ok).toBe(true);
            const run = (color: string) =>
                publishRaw(core, actor, access, 2, [
                    { type: "set_background", color },
                ]);

            let results: PromiseSettledResult<unknown>[];
            try {
                results = await Promise.allSettled([
                    run("#111111"),
                    run("#222222"),
                ]);
            } finally {
                core.MapLockService.release(
                    space.mapId,
                    "integration-publish-session"
                );
            }

            expect(
                results.filter(({ status }) => status === "fulfilled")
            ).toHaveLength(1);
            const rejected = results.find(
                (result): result is PromiseRejectedResult =>
                    result.status === "rejected"
            )!;
            expect(rejected.reason).toMatchObject({ status: 409 });
        });

        it("returns every error of a bad batch with the op index", async () => {
            const access = await accessOf("owner", space.mapId);
            const render = await core.MapService.buildRenderPayload(
                access,
                users.owner.id
            );

            await expect(
                publishAs("owner", space.mapId, render.map.layoutVersion, [
                    { type: "erase", layer: "ground", cells: [[500, 500]] },
                ])
            ).rejects.toMatchObject({
                status: 422,
                errors: [
                    expect.objectContaining({
                        opIndex: 0,
                        code: "CELL_OUT_OF_BOUNDS",
                    }),
                ],
            });
        });
    });

    describe("objects", () => {
        const placed: Record<string, string> = {};

        it("places a desk, and refuses overlap and out of bounds", async () => {
            const access = await accessOf("owner", space.mapId);
            const [desk] = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs.desk, tileX: 5, tileY: 5 }
            );
            placed.desk = desk.id;

            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.tree,
                    tileX: 6,
                    tileY: 5,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.tree,
                    tileX: 99,
                    tileY: 5,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
        });

        it("keeps SURFACE items inside the desk, and only on a desk", async () => {
            const access = await accessOf("owner", space.mapId);
            const [monitor] = await core.MapAssetService.place(
                access,
                users.owner.id,
                {
                    assetId: defs.monitor,
                    tileX: 5,
                    tileY: 5,
                    parentId: placed.desk,
                }
            );
            placed.monitor = monitor.id;

            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.monitor,
                    tileX: 5,
                    tileY: 5,
                    parentId: placed.desk,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.monitor,
                    tileX: 10,
                    tileY: 10,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.monitor,
                    tileX: 9,
                    tileY: 5,
                    parentId: placed.desk,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
        });

        it("puts wall objects only over walls", async () => {
            const access = await accessOf("owner", space.mapId);

            await expect(
                core.MapAssetService.place(access, users.owner.id, {
                    assetId: defs.poster,
                    tileX: 8,
                    tileY: 8,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });

            const [poster] = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs.poster, tileX: 0, tileY: 5 }
            );
            expect(poster.parentId).toBeNull();
        });

        it("refuses an asset from another organization's private library", async () => {
            const template = await core.MapTemplateService.create(
                users.admin.id,
                {
                    name: "Privado",
                    sizeTier: "XS",
                }
            );
            const access = await accessOf("admin", template.mapId);

            await expect(
                core.MapAssetService.place(access, users.admin.id, {
                    assetId: privateAssetId,
                    tileX: 3,
                    tileY: 3,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
        });

        it("creates a bundle with its parts, moves it together, detaches a moved part", async () => {
            const access = await accessOf("owner", space.mapId);
            const created = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs["desk-bundle"], tileX: 14, tileY: 8 }
            );
            expect(created).toHaveLength(2);
            const root = created.find(({ parentId }) => parentId === null)!;
            const part = created.find(({ parentId }) => parentId === root.id)!;
            expect(part).toMatchObject({ tileX: 14, tileY: 9 });

            const moved = await core.MapAssetService.update(
                access,
                users.owner.id,
                root.id,
                { tileX: 16, tileY: 8 }
            );
            expect(moved.placed.find(({ id }) => id === part.id)).toMatchObject(
                {
                    tileX: 16,
                    tileY: 9,
                }
            );

            const detached = await core.MapAssetService.update(
                access,
                users.owner.id,
                part.id,
                { tileX: 20, tileY: 9 }
            );
            expect(detached.placed[0].parentId).toBeNull();
            placed.bundleRoot = root.id;
            placed.bundlePart = part.id;
        });

        it("replaces a model keeping the row, and refuses one that cannot hold the children", async () => {
            const access = await accessOf("owner", space.mapId);

            const replaced = await core.MapAssetService.update(
                access,
                users.owner.id,
                placed.desk,
                { assetId: defs["desk-3"] }
            );
            expect(replaced).toMatchObject({ kind: "replaced" });
            expect(replaced.placed[0]).toMatchObject({
                id: placed.desk,
                assetId: defs["desk-3"],
            });

            await expect(
                core.MapAssetService.update(
                    access,
                    users.owner.id,
                    placed.desk,
                    {
                        assetId: defs.tree,
                    }
                )
            ).rejects.toMatchObject({ code: "MAP_ASSET_PLACEMENT_INVALID" });
        });
    });

    describe("desks", () => {
        let deskId: string;
        let freeDeskId: string;

        it("lets a member claim a free desk, and rejects a second claim", async () => {
            const access = await accessOf("owner", space.mapId);
            const [second] = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs.desk, tileX: 10, tileY: 12 }
            );
            deskId = (
                await core.MapService.buildRenderPayload(access, users.owner.id)
            ).placed.find(({ assetId }) => assetId === defs["desk-3"])!.id;
            freeDeskId = second.id;

            await core.DeskService.claim(space.id, deskId, users.member.id);

            await expect(
                core.DeskService.claim(space.id, deskId, users.other.id)
            ).rejects.toMatchObject({
                status: 409,
                code: "DESK_ALREADY_CLAIMED",
            });
            await expect(
                core.DeskService.claim(space.id, freeDeskId, users.member.id)
            ).rejects.toMatchObject({
                status: 409,
                code: "USER_ALREADY_HAS_DESK",
            });
        });

        it("rejects non members and non desks", async () => {
            await expect(
                core.DeskService.claim(space.id, freeDeskId, users.outsider.id)
            ).rejects.toMatchObject({ code: "DESK_USER_NOT_MEMBER" });

            const tree = (
                await core.MapAssetService.place(
                    await accessOf("owner", space.mapId),
                    users.owner.id,
                    { assetId: defs.tree, tileX: 2, tileY: 2 }
                )
            )[0];
            await expect(
                core.DeskService.claim(space.id, tree.id, users.other.id)
            ).rejects.toMatchObject({ code: "DESK_NOT_FOUND" });
        });

        it("swaps desks in one transaction when asked", async () => {
            const result = await core.DeskService.claim(
                space.id,
                freeDeskId,
                users.member.id,
                true
            );
            expect(result.releasedMapAssetId).toBe(deskId);

            const desks = await core.DeskService.list(space.id);
            expect(desks).toEqual([
                { mapAssetId: freeDeskId, userId: users.member.id },
            ]);
        });

        it("lets only one of two concurrent claims win", async () => {
            await core.DeskService.release(space.id, freeDeskId, {
                userId: users.member.id,
                canManage: false,
            });

            const results = await Promise.allSettled([
                core.DeskService.claim(space.id, deskId, users.member.id),
                core.DeskService.claim(space.id, deskId, users.other.id),
            ]);

            expect(
                results.filter(({ status }) => status === "fulfilled")
            ).toHaveLength(1);
            // Leave the desk to the member for the next tests.
            const desks = await core.DeskService.list(space.id);
            if (desks[0].userId !== users.member.id) {
                await core.DeskService.release(space.id, deskId, {
                    userId: users.owner.id,
                    canManage: true,
                });
                await core.DeskService.claim(space.id, deskId, users.member.id);
            }
        });

        it("keeps other people from freeing a desk, and lets the owner do it", async () => {
            await expect(
                core.DeskService.release(space.id, deskId, {
                    userId: users.other.id,
                    canManage: false,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_FORBIDDEN" });

            await core.DeskService.release(space.id, deskId, {
                userId: users.owner.id,
                canManage: true,
            });
            await core.DeskService.assign(
                space.id,
                deskId,
                users.member.id,
                users.owner.id
            );
            await expect(
                core.DeskService.assign(
                    space.id,
                    deskId,
                    users.other.id,
                    users.owner.id
                )
            ).rejects.toMatchObject({ code: "DESK_ALREADY_CLAIMED" });
        });

        it("lets a member decorate only their own desk", async () => {
            const memberAccess = await accessOf("member", space.mapId);
            const otherAccess = await accessOf("other", space.mapId);
            const ownerAccess = await accessOf("owner", space.mapId);

            const [plant] = await core.MapAssetService.place(
                memberAccess,
                users.member.id,
                { assetId: defs.monitor, tileX: 6, tileY: 5, parentId: deskId }
            );
            expect(plant.parentId).toBe(deskId);

            // Someone else's desk, and anything on the floor, is off limits.
            await expect(
                core.MapAssetService.place(otherAccess, users.other.id, {
                    assetId: defs.monitor,
                    tileX: 7,
                    tileY: 5,
                    parentId: deskId,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_FORBIDDEN" });
            await expect(
                core.MapAssetService.place(memberAccess, users.member.id, {
                    assetId: defs.tree,
                    tileX: 3,
                    tileY: 12,
                })
            ).rejects.toMatchObject({ code: "MAP_ASSET_FORBIDDEN" });
            await expect(
                core.MapAssetService.update(
                    memberAccess,
                    users.member.id,
                    deskId,
                    {
                        tileX: 1,
                        tileY: 12,
                    }
                )
            ).rejects.toMatchObject({ code: "MAP_ASSET_FORBIDDEN" });

            await core.MapAssetService.remove(
                memberAccess,
                users.member.id,
                plant.id,
                false
            );
            expect(ownerAccess.canEdit).toBe(true);
        });

        it("needs releaseDesk to delete a claimed desk, and then frees it", async () => {
            const access = await accessOf("owner", space.mapId);

            await expect(
                core.MapAssetService.remove(
                    access,
                    users.owner.id,
                    deskId,
                    false
                )
            ).rejects.toMatchObject({ status: 409, code: "DESK_CLAIMED" });

            const removed = await core.MapAssetService.remove(
                access,
                users.owner.id,
                deskId,
                true
            );
            // The monitor on top went with it.
            expect(removed.removedIds).toContain(deskId);
            expect(removed.removedIds).toHaveLength(2);
            expect(removed.releasedDeskUserId).toBe(users.member.id);
            expect(await core.DeskService.list(space.id)).toEqual([]);
        });

        it("detaches the GROUND children of a removed bundle root", async () => {
            const access = await accessOf("owner", space.mapId);
            const created = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs["desk-bundle"], tileX: 18, tileY: 3 }
            );
            const root = created.find(({ parentId }) => parentId === null)!;
            const part = created.find(({ parentId }) => parentId === root.id)!;

            const removed = await core.MapAssetService.remove(
                access,
                users.owner.id,
                root.id,
                false
            );

            expect(removed.removedIds).toEqual([root.id]);
            expect(removed.detachedIds).toEqual([part.id]);
        });
    });

    describe("templates", () => {
        let template: { id: string; mapId: string };

        it("creates a draft with its own blank map", async () => {
            const created = await core.MapTemplateService.create(
                users.admin.id,
                {
                    name: "Escritório",
                    description: "Modelo",
                    sizeTier: "S",
                }
            );
            template = { id: created.id, mapId: created.mapId };

            expect(created).toMatchObject({
                status: "DRAFT",
                sizeTier: "S",
                width: 30,
                height: 20,
                thumbnailUrl: null,
            });
        });

        it("refuses to publish without a thumbnail", async () => {
            await expect(
                core.MapTemplateService.publish(template.id)
            ).rejects.toMatchObject({
                code: "TEMPLATE_THUMBNAIL_REQUIRED",
            });
        });

        it("refuses to publish a template that uses a private asset", async () => {
            const privateTemplate = await core.MapTemplateService.create(
                users.admin.id,
                { name: "Com recurso privado", sizeTier: "XS" }
            );
            const { db, mapAssetsTable } = database;
            // Planted straight into the table, since the API refuses it.
            await db.insert(mapAssetsTable).values({
                mapId: privateTemplate.mapId,
                assetId: privateAssetId,
                tileX: 3,
                tileY: 3,
            });
            const png = core.encodePng(
                48,
                32,
                Array.from({ length: 48 * 32 }, () => [1, 1, 1, 255])
            );
            await core.MapTemplateService.setThumbnail(privateTemplate.id, {
                buffer: png,
                originalname: "t.png",
                mimetype: "image/png",
                size: png.length,
            });

            await expect(
                core.MapTemplateService.publish(privateTemplate.id)
            ).rejects.toMatchObject({
                code: "TEMPLATE_USES_NON_GLOBAL_ASSET",
            });
        });

        it("warns when the thumbnail proportion drifts, and publishes with a good one", async () => {
            const png = (width: number, height: number) =>
                core.encodePng(
                    width,
                    height,
                    Array.from({ length: width * height }, () => [1, 1, 1, 255])
                );
            const file = (buffer: Buffer) => ({
                buffer,
                originalname: "t.png",
                mimetype: "image/png",
                size: buffer.length,
            });

            const bad = await core.MapTemplateService.setThumbnail(
                template.id,
                file(png(40, 40))
            );
            expect(bad.warnings).toHaveLength(1);

            // 30 x 20 map is 3:2.
            const good = await core.MapTemplateService.setThumbnail(
                template.id,
                file(png(60, 40))
            );
            expect(good.warnings).toEqual([]);
            expect(good.template.thumbnailUrl).toContain("templates/");

            const published = await core.MapTemplateService.publish(
                template.id
            );
            expect(published.status).toBe("PUBLISHED");
        });

        it("lists by size tier and by who is asking", async () => {
            const all = await core.MapTemplateService.list();
            const onlyS = await core.MapTemplateService.list("S");
            const published = await core.MapTemplateService.listPublished();

            expect(all.length).toBeGreaterThanOrEqual(3);
            expect(onlyS.map(({ id }) => id)).toContain(template.id);
            // Other files publish templates to the same database too.
            expect(published.map(({ id }) => id)).toContain(template.id);
            expect(published.length).toBeLessThan(all.length);
            expect(
                await core.OrganizationService.isOwnerOfAny(users.owner.id)
            ).toBe(true);
            expect(
                await core.OrganizationService.isOwnerOfAny(users.member.id)
            ).toBe(false);
        });

        it("copies the map and the objects into a space, independent of the template", async () => {
            const adminAccess = await accessOf("admin", template.mapId);
            const [desk] = await core.MapAssetService.place(
                adminAccess,
                users.admin.id,
                { assetId: defs.desk, tileX: 4, tileY: 4 }
            );
            const [monitor] = await core.MapAssetService.place(
                adminAccess,
                users.admin.id,
                { assetId: defs.monitor, tileX: 4, tileY: 4, parentId: desk.id }
            );
            await publishAs("admin", template.mapId, 1, [
                { type: "set_background", color: "#abcdef" },
            ]);

            const copy = await core.SpaceService.create(
                organizationId,
                users.owner.id,
                { name: "Do template", templateId: template.id }
            );
            expect(copy.mapId).not.toBe(template.mapId);

            const render = await core.MapService.buildRenderPayload(
                await accessOf("owner", copy.mapId),
                users.owner.id
            );
            expect(render.map.layoutVersion).toBe(1);
            expect(
                (render.map.layout as { backgroundcolor: string })
                    .backgroundcolor
            ).toBe("#abcdef");
            expect(render.placed).toHaveLength(2);
            const copiedMonitor = render.placed.find(
                ({ assetId }) => assetId === defs.monitor
            )!;
            const copiedDesk = render.placed.find(
                ({ assetId }) => assetId === defs.desk
            )!;
            expect(copiedMonitor.id).not.toBe(monitor.id);
            expect(copiedDesk.id).not.toBe(desk.id);
            // The parent link was remapped to the copy.
            expect(copiedMonitor.parentId).toBe(copiedDesk.id);
            expect(render.desks).toEqual([]);

            // Editing the template afterwards leaves the space alone.
            await publishAs("admin", template.mapId, 2, [
                { type: "set_background", color: "#000000" },
            ]);
            const after = await core.MapService.buildRenderPayload(
                await accessOf("owner", copy.mapId),
                users.owner.id
            );
            expect(
                (after.map.layout as { backgroundcolor: string })
                    .backgroundcolor
            ).toBe("#abcdef");
        });

        it("only offers published, available templates", async () => {
            const draft = await core.MapTemplateService.create(users.admin.id, {
                name: "Rascunho",
                sizeTier: "XS",
            });

            await expect(
                core.SpaceService.create(organizationId, users.owner.id, {
                    name: "X",
                    templateId: draft.id,
                })
            ).rejects.toMatchObject({ code: "TEMPLATE_UNAVAILABLE" });
            await expect(
                core.SpaceService.create(organizationId, users.owner.id, {
                    name: "X",
                    templateId: "does-not-exist",
                })
            ).rejects.toMatchObject({ code: "TEMPLATE_UNAVAILABLE" });
        });

        it("retires, and only deletes a draft or retired template", async () => {
            await expect(
                core.MapTemplateService.delete(template.id)
            ).rejects.toMatchObject({
                code: "TEMPLATE_NOT_DELETABLE",
            });

            const retired = await core.MapTemplateService.retire(template.id);
            expect(retired.status).toBe("RETIRED");
            await expect(
                core.SpaceService.create(organizationId, users.owner.id, {
                    name: "X",
                    templateId: template.id,
                })
            ).rejects.toMatchObject({ code: "TEMPLATE_UNAVAILABLE" });
            await expect(
                core.MapTemplateService.retire(template.id)
            ).rejects.toMatchObject({
                code: "TEMPLATE_NOT_PUBLISHED",
            });

            await core.MapTemplateService.delete(template.id);
            await expect(
                core.MapTemplateService.findById(template.id)
            ).rejects.toMatchObject({
                code: "TEMPLATE_NOT_FOUND",
            });
        });
    });

    describe("color variants", () => {
        const COLORS = [
            ["red", "#D64545"],
            ["blue", "#3F6FD1"],
            ["green", "#3FA55B"],
            ["yellow", "#E2B93B"],
            ["white", "#EDEDED"],
        ] as const;
        const baseKey = `mug-${RUN}`;
        const png = () =>
            core.encodePng(
                32,
                32,
                Array.from({ length: 32 * 32 }, () => [9, 9, 9, 255])
            );
        const ctx = () => ({ organizationId: null, createdBy: users.admin.id });
        const color = (index: number) => ({
            key: COLORS[index][0],
            hex: COLORS[index][1],
        });

        const listFamily = async () => {
            const { db, assetsTable, and, eq, isNull, or } = database;
            const [base] = await db
                .select({ id: assetsTable.id })
                .from(assetsTable)
                .where(
                    and(
                        eq(assetsTable.key, baseKey),
                        isNull(assetsTable.deletedAt)
                    )
                );
            if (!base) return [];
            return db
                .select({
                    id: assetsTable.id,
                    key: assetsTable.key,
                    colorKey: assetsTable.colorKey,
                })
                .from(assetsTable)
                .where(
                    and(
                        or(
                            eq(assetsTable.id, base.id),
                            eq(assetsTable.baseAssetId, base.id)
                        ),
                        isNull(assetsTable.deletedAt)
                    )
                );
        };

        it("refuses a variation that repeats a color and writes nothing", async () => {
            const base = await core.AssetService.createAsset(
                { buffer: png() },
                {
                    key: baseKey,
                    name: "Caneca",
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    placement: "SURFACE",
                    footprint: { w: 1, h: 1 },
                    color: color(0),
                },
                ctx()
            );

            await expect(
                core.AssetService.createVariant(
                    base.id,
                    { buffer: png() },
                    { color: color(0) },
                    ctx()
                )
            ).rejects.toMatchObject({ code: "VARIANT_DUPLICATED" });

            expect(await listFamily()).toHaveLength(1);
        });

        it("creates 4 more colors on the base, one PNG each, in the same family", async () => {
            const [base] = await listFamily();
            for (const index of [1, 2, 3, 4]) {
                await core.AssetService.createVariant(
                    base.id,
                    { buffer: png() },
                    {
                        key: `${baseKey}-${COLORS[index][0]}`,
                        color: color(index),
                    },
                    ctx()
                );
            }

            const rows = await listFamily();
            expect(rows).toHaveLength(5);
            const ordered = [...rows].sort((a, b) => (a.id < b.id ? -1 : 1));
            expect(ordered.map(({ colorKey }) => colorKey)).toEqual(
                COLORS.map(([key]) => key)
            );

            const { family } = {
                family: await core.AssetService.getFamily(base.id, null),
            };
            expect(family).toMatchObject({
                familyId: base.id,
                variantCount: 5,
                colorCount: 5,
            });
        });

        it("keeps one row per color and rotation among the active ones", async () => {
            const { db, assetsTable, eq } = database;
            const [blue] = await db
                .select()
                .from(assetsTable)
                .where(eq(assetsTable.key, `${baseKey}-blue`));
            const { id: _id, ...copy } = blue;

            await expect(
                db.insert(assetsTable).values({ ...copy, key: `dup-${RUN}` })
            ).rejects.toThrow();
        });

        it("changes the color keeping position, parent and desk", async () => {
            const family = await listFamily();
            const byColor = Object.fromEntries(
                family.map(({ colorKey, id }) => [colorKey, id])
            );
            const access = await accessOf("owner", space.mapId);

            const [desk] = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: defs.desk, tileX: 12, tileY: 2 }
            );
            const [mug] = await core.MapAssetService.place(
                access,
                users.owner.id,
                {
                    assetId: byColor.red,
                    tileX: 12,
                    tileY: 2,
                    parentId: desk.id,
                }
            );

            const changed = await core.MapAssetService.update(
                access,
                users.owner.id,
                mug.id,
                { assetId: byColor.blue, colorChange: true }
            );
            expect(changed).toMatchObject({ kind: "replaced" });
            expect(changed.placed[0]).toMatchObject({
                id: mug.id,
                assetId: byColor.blue,
                tileX: 12,
                tileY: 2,
                parentId: desk.id,
            });

            for (const target of [defs.monitor, byColor.blue]) {
                await expect(
                    core.MapAssetService.update(
                        access,
                        users.owner.id,
                        mug.id,
                        { assetId: target, colorChange: true }
                    )
                ).rejects.toMatchObject({
                    code: "COLOR_CHANGE_INVALID_TARGET",
                    status: 422,
                });
            }
        });

        it("changes the color of a desk keeping its items and its occupant", async () => {
            const deskPng = core.encodePng(
                64,
                32,
                Array.from({ length: 64 * 32 }, () => [9, 9, 9, 255])
            );
            const deskKey = `color-desk-${RUN}`;
            const deskBase = await core.AssetService.createAsset(
                { buffer: deskPng },
                {
                    key: deskKey,
                    name: "Mesa colorida",
                    type: "DESK",
                    category: "ROOM_DECOR",
                    placement: "GROUND",
                    solid: true,
                    surfaceHeightPx: 8,
                    footprint: { w: 2, h: 1 },
                    color: color(0),
                },
                ctx()
            );
            const deskBlue = await core.AssetService.createVariant(
                deskBase.id,
                { buffer: deskPng },
                { color: color(1) },
                ctx()
            );
            const [mugRed] = (await listFamily()).filter(
                ({ colorKey }) => colorKey === "red"
            );
            const access = await accessOf("owner", space.mapId);

            const [desk] = await core.MapAssetService.place(
                access,
                users.owner.id,
                { assetId: deskBase.id, tileX: 2, tileY: 14 }
            );
            const [item] = await core.MapAssetService.place(
                access,
                users.owner.id,
                {
                    assetId: mugRed.id,
                    tileX: 2,
                    tileY: 14,
                    parentId: desk.id,
                }
            );
            await core.DeskService.claim(space.id, desk.id, users.member.id);

            await core.MapAssetService.update(access, users.owner.id, desk.id, {
                assetId: deskBlue.id,
                colorChange: true,
            });

            const payload = await core.MapService.buildRenderPayload(
                access,
                users.owner.id
            );
            expect(
                payload.placed.find(({ id }) => id === desk.id)
            ).toMatchObject({ assetId: deskBlue.id, tileX: 2, tileY: 14 });
            expect(
                payload.placed.find(({ id }) => id === item.id)
            ).toMatchObject({ parentId: desk.id });
            const desks = await core.DeskService.list(space.id);
            expect(JSON.stringify(desks)).toContain(users.member.id);
        });

        it("freezes the structure of a family that a map uses", async () => {
            const [base] = (await listFamily()).filter(
                ({ key }) => key === baseKey
            );

            await expect(
                core.AssetService.updateAsset(base.id, null, { solid: true })
            ).rejects.toMatchObject({
                code: "ASSET_IN_USE_IMMUTABLE",
                status: 409,
            });

            const renamed = await core.AssetService.updateAsset(base.id, null, {
                name: "Caneca de cafe",
            });
            expect(renamed.assets).toHaveLength(5);
            expect(
                renamed.assets.every(({ name }) => name === "Caneca de cafe")
            ).toBe(true);
        });
    });

    describe("animated pieces", () => {
        const doorKey = `door-${RUN}`;
        // A strip of 3 frames of 32 x 64.
        const strip = () =>
            core.encodePng(
                96,
                64,
                Array.from({ length: 96 * 64 }, () => [9, 9, 9, 255])
            );
        const ctx = () => ({ organizationId: null, createdBy: users.admin.id });
        const animation = {
            frameCount: 3,
            frameDurationMs: 120,
            repeat: -1,
        };

        it("refuses a strip whose width the frame count does not divide", async () => {
            await expect(
                core.AssetService.createAsset(
                    {
                        buffer: core.encodePng(
                            100,
                            64,
                            Array.from({ length: 100 * 64 }, () => [
                                9, 9, 9, 255,
                            ])
                        ),
                    },
                    {
                        key: doorKey,
                        name: "Porta",
                        type: "DOOR",
                        footprint: { w: 1, h: 1 },
                        animation,
                    },
                    ctx()
                )
            ).rejects.toMatchObject({
                errors: expect.arrayContaining([
                    expect.objectContaining({
                        code: "ANIMATION_FRAME_WIDTH_INVALID",
                    }),
                ]),
            });
        });

        it("stores the frame size and the strip, and the render payload carries them", async () => {
            const door = await core.AssetService.createAsset(
                { buffer: strip() },
                {
                    key: doorKey,
                    name: "Porta",
                    type: "DOOR",
                    footprint: { w: 1, h: 1 },
                    color: { key: "oak", hex: "#B98B5E" },
                    animation,
                },
                ctx()
            );
            const walnut = await core.AssetService.createVariant(
                door.id,
                { buffer: strip() },
                {
                    key: `${doorKey}-walnut`,
                    color: { key: "walnut", hex: "#5C4033" },
                },
                ctx()
            );

            expect(door).toMatchObject({
                sprite: { w: 32, h: 64 },
                animation,
            });
            // The variation of an animated base is animated the same way.
            expect(walnut.animation).toEqual(animation);

            const access = await accessOf("owner", space.mapId);
            await core.MapAssetService.place(access, users.owner.id, {
                assetId: door.id,
                tileX: 18,
                tileY: 12,
            });
            const payload = await core.MapService.buildRenderPayload(
                access,
                users.owner.id
            );
            const rendered = payload.assets.find(({ id }) => id === door.id);
            expect(rendered?.animation).toEqual(animation);
            expect(rendered?.url).toMatch(/^\/files\/[\w-]+$/);
            for (const tileset of payload.tilesets) {
                expect(tileset).toHaveProperty("tileCount");
            }
        });

        it("does not let the frame count change", async () => {
            const [door] = await database.db
                .select({ id: database.assetsTable.id })
                .from(database.assetsTable)
                .where(database.eq(database.assetsTable.key, doorKey));

            await expect(
                core.AssetService.updateAsset(door.id, null, {
                    animation: { frameCount: 4 },
                })
            ).rejects.toMatchObject({
                errors: [
                    expect.objectContaining({ code: "ANIMATION_IMMUTABLE" }),
                ],
            });
        });
    });

    describe("editor model", () => {
        it("loads the same model the client builds from the render payload", async () => {
            const access = await accessOf("owner", space.mapId);
            const render = await core.MapService.buildRenderPayload(
                access,
                users.owner.id
            );
            const palette = await core.AssetService.getMapPalette(access);
            const { buildEditorModel } = await import("@standin/contracts");
            const expected = buildEditorModel(render, palette);

            const model = await database.db.transaction((tx) =>
                core.MapPublishService.loadEditorModel(tx, access)
            );

            expect(render.placed.length).toBeGreaterThan(0);
            expect(model).toEqual(expected);
            expect(model.limits.objectsUsed).toBe(render.placed.length);
        });
    });

    describe("deleting a space", () => {
        it("takes the map and its objects with it", async () => {
            await core.SpaceService.delete(organizationId, space.id);

            const { db, mapsTable, mapAssetsTable, and, eq, isNull } = database;
            const [map] = await db
                .select({ deletedAt: mapsTable.deletedAt })
                .from(mapsTable)
                .where(eq(mapsTable.id, space.mapId));
            const alive = await db
                .select({ id: mapAssetsTable.id })
                .from(mapAssetsTable)
                .where(
                    and(
                        eq(mapAssetsTable.mapId, space.mapId),
                        isNull(mapAssetsTable.deletedAt)
                    )
                );

            expect(map.deletedAt).not.toBeNull();
            expect(alive).toEqual([]);
        });
    });
});
