import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { buildEditorModel } from "@standin/contracts";
import type { EditorModel, PlacedAsset } from "@standin/contracts";

// Runs persistModelDiff against a real Postgres. Off by default: point
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

describe.skipIf(!enabled)("persistModelDiff (real database)", () => {
    let core: Core;
    let database: Database;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    let ownerId: string;
    let guestId: string;
    let spaceId: string;
    let mapId: string;
    const defs = {} as Record<"desk" | "monitor" | "tree", string>;

    const load = async () => {
        const access = await core.MapService.getAccess(
            { id: ownerId, role: "USER" },
            mapId
        );
        return {
            access,
            model: await database.db.transaction((tx) =>
                core.MapPublishService.loadEditorModel(tx, access)
            ),
        };
    };

    const place = (
        id: string,
        assetId: string,
        tileX: number,
        tileY: number,
        parentId: string | null = null
    ): PlacedAsset =>
        ({
            id,
            assetId,
            tileX,
            tileY,
            parentId,
            propertyOverrides: null,
        }) as PlacedAsset;

    const withPlaced = (
        model: EditorModel,
        placed: PlacedAsset[]
    ): EditorModel => ({
        ...model,
        placed,
        limits: { ...model.limits, objectsUsed: placed.length },
    });

    const persist = async (
        before: EditorModel,
        after: EditorModel,
        releaseDeskIds: string[] = []
    ) => {
        const { access } = await load();
        return database.db.transaction((tx) =>
            core.MapPublishService.persistModelDiff(tx, access, before, after, {
                releaseDeskIds,
            })
        );
    };

    const activeRows = async () => {
        const { db, mapAssetsTable, and, eq, isNull } = database;
        return db
            .select()
            .from(mapAssetsTable)
            .where(
                and(
                    eq(mapAssetsTable.mapId, mapId),
                    isNull(mapAssetsTable.deletedAt)
                )
            );
    };

    const versionOf = async () => {
        const { db, mapsTable, eq } = database;
        const [row] = await db
            .select({ v: mapsTable.layoutVersion })
            .from(mapsTable)
            .where(eq(mapsTable.id, mapId));
        return row.v;
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { db, usersTable } = database;

        const make = async (key: string, role: "ADMIN" | "USER") => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@publish.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            return row.id;
        };
        const adminId = await make("pub-admin", "ADMIN");
        ownerId = await make("pub-owner", "USER");
        guestId = await make("pub-guest", "USER");

        await core.AssetService.seed(
            {
                tilesets: core.DEFAULT_LIBRARY_SEED.tilesets,
                assets: [],
            },
            { createdBy: adminId }
        );

        const create = async (
            key: keyof typeof defs,
            data: Partial<import("@standin/contracts").CreateAssetData>
        ) => {
            const asset = await core.AssetService.createAsset(
                {
                    buffer: core.encodePng(
                        32,
                        32,
                        Array.from({ length: 32 * 32 }, () => [9, 9, 9, 255])
                    ),
                },
                {
                    key: `pub-${key}-${RUN}`,
                    name: key,
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    footprint: { w: 1, h: 1 },
                    ...data,
                },
                { organizationId: null, createdBy: adminId }
            );
            defs[key] = asset.id;
        };
        await create("desk", { type: "DESK", solid: true });
        await create("monitor", { type: "MONITOR", placement: "SURFACE" });
        await create("tree", { type: "TREE", solid: true });

        const organization = await core.OrganizationService.create(ownerId, {
            name: "Publish Org",
        });
        const space = await core.SpaceService.create(organization.id, ownerId, {
            name: "Publish",
            sizeTier: "XS",
        });
        spaceId = space.id;
        mapId = space.mapId;
    });

    let deskRealId: string;
    let monitorRealId: string;

    it("inserts a parent and its child, resolving tempIds and parentIds", async () => {
        const { model } = await load();
        // The child is listed first on purpose.
        const after = withPlaced(model, [
            place("temp-monitor", defs.monitor, 4, 4, "temp-desk"),
            place("temp-desk", defs.desk, 4, 4),
        ]);

        const result = await persist(model, after);

        deskRealId = result.idMap["temp-desk"];
        monitorRealId = result.idMap["temp-monitor"];
        expect(deskRealId).toBeTruthy();
        expect(monitorRealId).toBeTruthy();
        expect(deskRealId).not.toBe("temp-desk");
        expect(result.releasedDesks).toEqual([]);
        expect(result.limits).toEqual(after.limits);
        // The layout did not change, so the version stays.
        expect(result.version).toBe(model.version);

        const rows = await activeRows();
        expect(rows).toHaveLength(2);
        expect(rows.find(({ id }) => id === monitorRealId)).toMatchObject({
            parentId: deskRealId,
            assetId: defs.monitor,
        });
        expect(await versionOf()).toBe(model.version);
    });

    it("updates the position and keeps the version when the layout is equal", async () => {
        const { model } = await load();
        const after = withPlaced(
            model,
            model.placed.map((item) =>
                item.id === deskRealId ? { ...item, tileX: 6, tileY: 5 } : item
            )
        );

        const result = await persist(model, after);

        expect(result.idMap).toEqual({});
        expect(result.version).toBe(model.version);
        const desk = (await activeRows()).find(({ id }) => id === deskRealId);
        expect(desk).toMatchObject({ tileX: 6, tileY: 5 });
    });

    it("raises the version only when the layout changed", async () => {
        const { model } = await load();
        const after: EditorModel = {
            ...model,
            layout: {
                ...model.layout,
                layers: model.layout.layers.map((layer, index) =>
                    index === 0 ? { ...layer, name: `renamed-${RUN}` } : layer
                ),
            },
        };

        const result = await persist(model, after);

        expect(result.version).toBe(model.version + 1);
        expect(await versionOf()).toBe(model.version + 1);
        const reloaded = await load();
        expect(reloaded.model.layout.layers[0].name).toBe(`renamed-${RUN}`);
    });

    it("loads the same desks and objects as the client model of the render", async () => {
        const { db, deskAssignmentsTable, eq } = database;
        await db.insert(deskAssignmentsTable).values({
            spaceId,
            mapAssetId: deskRealId,
            userId: guestId,
        });
        const { access, model } = await load();
        const render = await core.MapService.buildRenderPayload(
            access,
            ownerId
        );
        const client = buildEditorModel(render, model.library);

        expect(model.desks).toEqual([
            { mapAssetId: deskRealId, userId: guestId },
        ]);
        expect(model.desks).toEqual(client.desks);
        expect(model.placed).toEqual(client.placed);
        expect(model.limits).toEqual(client.limits);
        expect(model.version).toBe(client.version);

        await db
            .delete(deskAssignmentsTable)
            .where(eq(deskAssignmentsTable.mapAssetId, deskRealId));
    });

    it("refuses to delete a claimed desk and writes nothing", async () => {
        const { db, deskAssignmentsTable } = database;
        await db.insert(deskAssignmentsTable).values({
            spaceId,
            mapAssetId: deskRealId,
            userId: guestId,
        });
        const { model } = await load();
        const after = withPlaced(model, []);
        const versionBefore = await versionOf();

        await expect(persist(model, after)).rejects.toMatchObject({
            code: "DESK_CLAIMED",
            status: 409,
        });

        expect(await activeRows()).toHaveLength(2);
        expect(await versionOf()).toBe(versionBefore);
    });

    it("rolls back the layout and the objects of a refused diff", async () => {
        const { model } = await load();
        const after: EditorModel = {
            ...withPlaced(model, [place("temp-tree", defs.tree, 9, 9)]),
            layout: {
                ...model.layout,
                layers: model.layout.layers.map((layer, index) =>
                    index === 0 ? { ...layer, name: `lost-${RUN}` } : layer
                ),
            },
        };
        const versionBefore = await versionOf();

        await expect(persist(model, after)).rejects.toMatchObject({
            code: "DESK_CLAIMED",
        });

        expect(await versionOf()).toBe(versionBefore);
        expect((await load()).model.layout.layers[0].name).toBe(
            `renamed-${RUN}`
        );
        expect(await activeRows()).toHaveLength(2);
    });

    it("releases the desk when its id is allowed and reports who lost it", async () => {
        const { model } = await load();
        const after = withPlaced(model, []);

        const result = await persist(model, after, [deskRealId]);

        expect(result.releasedDesks).toEqual([
            { mapAssetId: deskRealId, userId: guestId },
        ]);
        expect(await activeRows()).toHaveLength(0);

        const { db, deskAssignmentsTable, and, eq, isNull } = database;
        const active = await db
            .select()
            .from(deskAssignmentsTable)
            .where(
                and(
                    eq(deskAssignmentsTable.mapAssetId, deskRealId),
                    isNull(deskAssignmentsTable.deletedAt)
                )
            );
        expect(active).toHaveLength(0);
    });
});

describe.skipIf(!enabled)("MapPublishService.publish (real database)", () => {
    let core: Core;
    let database: Database;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    let ownerId: string;
    let guestId: string;
    let spaceId: string;
    let mapId: string;
    const defs = {} as Record<"desk" | "monitor", string>;
    const SESSION = `session-${RUN}`;
    let counter = 0;
    const nextPublishId = () =>
        `00000000-0000-4000-8000-${(RUN + String(++counter))
            .replace(/[^0-9a-f]/g, "0")
            .padStart(12, "0")
            .slice(-12)}`;

    const owner = () => ({ id: ownerId, role: "USER" as const });
    const getAccess = () => core.MapService.getAccess(owner(), mapId);

    const publish = async (
        ops: import("@standin/contracts").EditorOp[],
        options: {
            baseVersion?: number;
            publishId?: string;
            sessionId?: string;
        } = {}
    ) => {
        const baseVersion = options.baseVersion ?? (await versionOf());
        return core.MapPublishService.publish(
            owner(),
            await getAccess(),
            options.sessionId ?? SESSION,
            {
                publishId: options.publishId ?? nextPublishId(),
                baseVersion,
                ops,
            }
        );
    };

    const versionOf = async () => {
        const { db, mapsTable, eq } = database;
        const [row] = await db
            .select({ v: mapsTable.layoutVersion })
            .from(mapsTable)
            .where(eq(mapsTable.id, mapId));
        return row.v;
    };

    const activeRows = async () => {
        const { db, mapAssetsTable, and, eq, isNull } = database;
        return db
            .select()
            .from(mapAssetsTable)
            .where(
                and(
                    eq(mapAssetsTable.mapId, mapId),
                    isNull(mapAssetsTable.deletedAt)
                )
            );
    };

    const acquire = () =>
        core.MapLockService.acquire(
            mapId,
            { id: ownerId, name: "Owner" },
            SESSION
        );

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { db, usersTable } = database;

        const make = async (key: string, role: "ADMIN" | "USER") => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@publishmap.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            return row.id;
        };
        const adminId = await make("pm-admin", "ADMIN");
        ownerId = await make("pm-owner", "USER");
        guestId = await make("pm-guest", "USER");

        await core.AssetService.seed(
            {
                tilesets: core.DEFAULT_LIBRARY_SEED.tilesets,
                assets: [],
            },
            { createdBy: adminId }
        );

        const create = async (
            key: keyof typeof defs,
            data: Partial<import("@standin/contracts").CreateAssetData>
        ) => {
            const asset = await core.AssetService.createAsset(
                {
                    buffer: core.encodePng(
                        32,
                        32,
                        Array.from({ length: 32 * 32 }, () => [9, 9, 9, 255])
                    ),
                },
                {
                    key: `pm-${key}-${RUN}`,
                    name: key,
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    footprint: { w: 1, h: 1 },
                    ...data,
                },
                { organizationId: null, createdBy: adminId }
            );
            defs[key] = asset.id;
        };
        await create("desk", { type: "DESK", solid: true });
        await create("monitor", { type: "MONITOR", placement: "SURFACE" });

        const organization = await core.OrganizationService.create(ownerId, {
            name: "Publish Map Org",
        });
        const space = await core.SpaceService.create(organization.id, ownerId, {
            name: "PublishMap",
            sizeTier: "XS",
        });
        spaceId = space.id;
        mapId = space.mapId;
        acquire();
    });

    let deskRealId: string;

    it("publishes set_background and raises the version", async () => {
        const before = await versionOf();

        const { result, releasedDesks } = await publish([
            { type: "set_background", color: "#123456" },
        ]);

        expect(result.version).toBe(before + 1);
        expect(result.idMap).toEqual({});
        expect(releasedDesks).toEqual([]);
        expect(await versionOf()).toBe(before + 1);
    });

    it("places an asset with a tempId and returns the real id", async () => {
        const { result } = await publish([
            {
                type: "place_asset",
                tempId: "temp-desk",
                assetId: defs.desk,
                tileX: 4,
                tileY: 4,
            },
            {
                type: "place_asset",
                tempId: "temp-monitor",
                assetId: defs.monitor,
                tileX: 4,
                tileY: 4,
                parentId: "temp-desk",
            },
        ]);

        deskRealId = result.idMap["temp-desk"];
        expect(deskRealId).toBeTruthy();
        expect(result.idMap["temp-monitor"]).toBeTruthy();
        expect(result.limits.objectsUsed).toBe(2);
        const rows = await activeRows();
        expect(rows).toHaveLength(2);
        expect(
            rows.find(({ id }) => id === result.idMap["temp-monitor"])
        ).toMatchObject({ parentId: deskRealId });
    });

    it("answers a repeated publishId with the same result and does not run again", async () => {
        const publishId = nextPublishId();
        const ops: import("@standin/contracts").EditorOp[] = [
            { type: "set_background", color: "#654321" },
        ];
        const first = await publish(ops, { publishId });
        const versionAfter = await versionOf();

        const second = await publish(ops, {
            publishId,
            baseVersion: versionAfter - 1,
        });

        expect(second.result).toEqual(first.result);
        expect(second.releasedDesks).toEqual([]);
        expect(await versionOf()).toBe(versionAfter);
    });

    it("refuses an old baseVersion with 409", async () => {
        const current = await versionOf();
        await expect(
            publish([{ type: "set_background", color: "#111111" }], {
                baseVersion: current - 1,
            })
        ).rejects.toMatchObject({
            code: "STALE_LAYOUT_VERSION",
            status: 409,
            currentVersion: current,
        });
        expect(await versionOf()).toBe(current);
    });

    it("answers 422 with the right opIndex and writes nothing", async () => {
        const version = await versionOf();
        const rowsBefore = (await activeRows()).length;

        const error = await publish([
            { type: "set_background", color: "#222222" },
            {
                type: "place_asset",
                tempId: "temp-ok",
                assetId: defs.desk,
                tileX: 8,
                tileY: 8,
            },
            {
                type: "place_asset",
                tempId: "temp-bad",
                assetId: defs.desk,
                tileX: 9999,
                tileY: 9999,
            },
        ]).catch((caught) => caught);

        expect(error).toMatchObject({ status: 422 });
        // The replay stops at the first failure: one operation only.
        const indexes = new Set(
            error.errors.map(({ opIndex }: { opIndex: number }) => opIndex)
        );
        expect([...indexes]).toEqual([2]);
        expect(await versionOf()).toBe(version);
        expect(await activeRows()).toHaveLength(rowsBefore);
    });

    it("refuses a session that does not hold the lock", async () => {
        await expect(
            publish([{ type: "set_background", color: "#333333" }], {
                sessionId: `other-${RUN}`,
            })
        ).rejects.toMatchObject({ code: "LOCK_NOT_HELD", status: 423 });
    });

    it("refuses when nobody holds the lock", async () => {
        core.MapLockService.release(mapId, SESSION);
        await expect(
            publish([{ type: "set_background", color: "#333333" }])
        ).rejects.toMatchObject({ code: "LOCK_NOT_HELD" });
        acquire();
    });

    it("refuses deleting a claimed desk without releaseDesk, then releases it", async () => {
        const { db, deskAssignmentsTable } = database;
        await db.insert(deskAssignmentsTable).values({
            spaceId,
            mapAssetId: deskRealId,
            userId: guestId,
        });
        const version = await versionOf();
        const rowsBefore = (await activeRows()).length;

        await expect(
            publish([{ type: "remove_asset", id: deskRealId }])
        ).rejects.toMatchObject({
            code: "PUBLISH_INVALID",
            status: 422,
            errors: [{ opIndex: 0, code: "DESK_CLAIMED" }],
        });
        expect(await versionOf()).toBe(version);
        expect(await activeRows()).toHaveLength(rowsBefore);

        const { releasedDesks } = await publish([
            { type: "remove_asset", id: deskRealId, releaseDesk: true },
        ]);

        expect(releasedDesks).toEqual([
            { mapAssetId: deskRealId, userId: guestId },
        ]);
        expect(await activeRows()).toHaveLength(0);
    });

    it("keeps the lock with who published", async () => {
        const lock = core.MapLockService.get(mapId);
        expect(lock?.sessionId).toBe(SESSION);
        expect(lock?.lastPublish?.publishId).toBeTruthy();
    });
});
