import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// The thumbnail of a space over the real Express stack, against a real
// Postgres: the first upload, the replacement that removes the old file, every
// refusal, and the cleanup when the space goes away. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type UserKey = "owner" | "member" | "outsider";
type Json = any;

describe.skipIf(!enabled)("space thumbnail over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: "USER" }>;
    let organizationId: string;
    let space: { id: string };

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: FormData | Json
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        const isForm = body instanceof FormData;
        const isJson = body !== undefined && !isForm;
        if (isJson) headers["content-type"] = "application/json";
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: isJson ? JSON.stringify(body) : (body as FormData),
        });
        const text = await response.text();
        let json: Json = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = text;
        }
        return { status: response.status, body: json };
    };

    const png = (width: number, height: number, red: number) =>
        sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: red, g: 40, b: 40 },
            },
        })
            .png()
            .toBuffer();

    const photoForm = (
        bytes: Buffer,
        type = "image/png",
        field = "thumbnail",
        filename = "photo.png"
    ) => {
        const form = new FormData();
        form.append(
            field,
            new Blob([new Uint8Array(bytes)], { type }),
            filename
        );
        return form;
    };

    const route = (id = space.id) =>
        `/organizations/${organizationId}/spaces/${id}/thumbnail`;

    const upload = async (as: UserKey | null, bytes: Buffer, id?: string) =>
        call(as, "PUT", route(id), photoForm(bytes));

    // The url carries SERVER_URL; the test server listens on its own port.
    const fileStatus = async (fileUrl: string) =>
        (await fetch(`${baseUrl}${new URL(fileUrl, baseUrl).pathname}`)).status;

    const storedFileId = async (id: string) => {
        const { db, spacesTable, eq } = database;
        const [row] = await db
            .select({ thumbnailFileId: spacesTable.thumbnailFileId })
            .from(spacesTable)
            .where(eq(spacesTable.id, id));
        return row.thumbnailFileId;
    };

    const fileRow = async (fileId: string) => {
        const { db, filesTable, eq } = database;
        const [row] = await db
            .select({ deletedAt: filesTable.deletedAt })
            .from(filesTable)
            .where(eq(filesTable.id, fileId));
        return row;
    };

    const createSpace = async (name: string) => {
        const created = await call(
            "owner",
            "POST",
            `/organizations/${organizationId}/spaces`,
            { name, sizeTier: "XS" }
        );
        expect(created.status).toBe(201);
        return { id: created.body.space.id as string };
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;
        const make = async (key: UserKey) => {
            const [created] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@thumbnail.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            users[key] = { id: created.id, role: "USER" };
        };
        for (const key of ["owner", "member", "outsider"] as const) {
            await make(key);
        }

        // A blank map needs the default floor, which the library seed brings.
        const [admin] = await db
            .insert(usersTable)
            .values({
                name: "admin",
                email: `admin-${RUN}@thumbnail.dev`,
                password: "x",
                role: "ADMIN",
            })
            .returning({ id: usersTable.id });
        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: admin.id }
        );

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Thumbnail Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });

        server = http.createServer(createApp());
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        space = await createSpace("Photo space");
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    it("asks for a signed in user", async () => {
        expect((await upload(null, await png(160, 90, 10))).status).toBe(401);
    });

    it("keeps out someone who is not in the organization", async () => {
        const response = await upload("outsider", await png(160, 90, 10));

        expect(response.status).toBe(403);
        expect(await storedFileId(space.id)).toBeNull();
    });

    it("starts with no thumbnail, in the list and in the detail", async () => {
        const list = await call(
            "owner",
            "GET",
            `/organizations/${organizationId}/spaces`
        );
        const details = await call(
            "owner",
            "GET",
            `/organizations/${organizationId}/spaces/${space.id}`
        );

        expect(list.body.spaces[0].thumbnailUrl).toBeNull();
        expect(details.body.space.thumbnailUrl).toBeNull();
    });

    it("stores the first photo and serves it", async () => {
        const response = await upload("owner", await png(160, 90, 200));

        expect(response.status).toBe(200);
        expect(response.body.space.id).toBe(space.id);
        expect(response.body.space.thumbnailUrl).toEqual(expect.any(String));
        expect(await fileStatus(response.body.space.thumbnailUrl)).toBe(200);
        expect(await storedFileId(space.id)).not.toBeNull();
    });

    it("shows the photo in the list and in the detail", async () => {
        const list = await call(
            "owner",
            "GET",
            `/organizations/${organizationId}/spaces`
        );
        const details = await call(
            "owner",
            "GET",
            `/organizations/${organizationId}/spaces/${space.id}`
        );

        const listed = list.body.spaces.find((s: Json) => s.id === space.id);
        expect(listed.thumbnailUrl).toEqual(expect.any(String));
        expect(details.body.space.thumbnailUrl).toBe(listed.thumbnailUrl);
        expect(listed).not.toHaveProperty("thumbnailFileId");
    });

    it("replaces the photo and removes the old file from storage", async () => {
        const oldFileId = (await storedFileId(space.id))!;
        const oldUrl = (
            await call(
                "owner",
                "GET",
                `/organizations/${organizationId}/spaces/${space.id}`
            )
        ).body.space.thumbnailUrl as string;

        const response = await upload("owner", await png(160, 90, 30));

        expect(response.status).toBe(200);
        const newFileId = (await storedFileId(space.id))!;
        expect(newFileId).not.toBe(oldFileId);
        expect(response.body.space.thumbnailUrl).not.toBe(oldUrl);
        expect(await fileStatus(response.body.space.thumbnailUrl)).toBe(200);
        expect(await fileStatus(oldUrl)).toBe(404);
        expect((await fileRow(oldFileId)).deletedAt).not.toBeNull();
    });

    it("is a permission of the owner, like editing the space", async () => {
        const before = await storedFileId(space.id);

        const response = await upload("member", await png(160, 90, 90));

        expect(response.status).toBe(403);
        expect(await storedFileId(space.id)).toBe(before);
    });

    it("refuses a request without a file", async () => {
        const before = await storedFileId(space.id);

        const response = await call("owner", "PUT", route(), new FormData());

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("FILE_MISSING");
        expect(await storedFileId(space.id)).toBe(before);
    });

    it("refuses a file that is not an image", async () => {
        const before = await storedFileId(space.id);

        const response = await call(
            "owner",
            "PUT",
            route(),
            photoForm(Buffer.from("not an image"), "application/pdf")
        );

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("FILE_UNSUPPORTED_TYPE");
        expect(await storedFileId(space.id)).toBe(before);
    });

    it("never serves an upload as the type its file name says", async () => {
        const response = await call(
            "owner",
            "PUT",
            route(),
            photoForm(
                await png(160, 90, 60),
                "image/png",
                "thumbnail",
                "x.html"
            )
        );

        expect(response.status).toBe(200);
        const fileUrl = response.body.space.thumbnailUrl as string;
        expect(new URL(fileUrl, baseUrl).pathname).toMatch(/\.png$/);
        const served = await fetch(
            `${baseUrl}${new URL(fileUrl, baseUrl).pathname}`
        );
        expect(served.headers.get("content-type")).toBe("image/png");
    });

    it("refuses bytes that are not a PNG even when declared as one", async () => {
        const before = await storedFileId(space.id);

        const response = await call(
            "owner",
            "PUT",
            route(),
            photoForm(
                Buffer.from(
                    "<script>alert(document.cookie)</script>".padEnd(40)
                ),
                "image/png",
                "thumbnail",
                "x.html"
            )
        );

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("FILE_UNSUPPORTED_TYPE");
        expect(await storedFileId(space.id)).toBe(before);
    });

    it("refuses a space that does not exist, with no file left behind", async () => {
        const { db, filesTable } = database;
        const [{ count: before }] = await db
            .select({ count: database.sql<number>`count(*)::int` })
            .from(filesTable);

        const response = await upload(
            "owner",
            await png(160, 90, 10),
            "00000000-0000-4000-8000-000000000000"
        );

        const [{ count: after }] = await db
            .select({ count: database.sql<number>`count(*)::int` })
            .from(filesTable);
        expect(response.status).toBe(404);
        expect(after).toBe(before);
    });

    it("does not reach a space of another organization", async () => {
        const other = await core.OrganizationService.create(users.outsider.id, {
            name: "Foreign Thumbnail Org",
        });
        const foreign = await call(
            "outsider",
            "POST",
            `/organizations/${other.id}/spaces`,
            { name: "Foreign", sizeTier: "XS" }
        );
        const foreignId = foreign.body.space.id as string;

        const response = await upload(
            "owner",
            await png(160, 90, 10),
            foreignId
        );

        expect(response.status).toBe(404);
        expect(await storedFileId(foreignId)).toBeNull();
    });

    it("removes the photos of its spaces when the organization is deleted", async () => {
        const doomed = await core.OrganizationService.create(users.owner.id, {
            name: "Doomed Thumbnail Org",
        });
        const created = await call(
            "owner",
            "POST",
            `/organizations/${doomed.id}/spaces`,
            { name: "Inside", sizeTier: "XS" }
        );
        const inside = created.body.space.id as string;
        const uploaded = await call(
            "owner",
            "PUT",
            `/organizations/${doomed.id}/spaces/${inside}/thumbnail`,
            photoForm(await png(160, 90, 150))
        );
        const fileUrl = uploaded.body.space.thumbnailUrl as string;
        expect(await fileStatus(fileUrl)).toBe(200);

        const deleted = await call(
            "owner",
            "DELETE",
            `/organizations/${doomed.id}`
        );

        expect(deleted.status).toBe(200);
        expect(await fileStatus(fileUrl)).toBe(404);
    });

    it("removes the file from storage when the space is deleted", async () => {
        const doomed = await createSpace("Doomed");
        const uploaded = await upload(
            "owner",
            await png(160, 90, 120),
            doomed.id
        );
        const fileId = (await storedFileId(doomed.id))!;
        const fileUrl = uploaded.body.space.thumbnailUrl as string;
        expect(await fileStatus(fileUrl)).toBe(200);

        const deleted = await call(
            "owner",
            "DELETE",
            `/organizations/${organizationId}/spaces/${doomed.id}`
        );

        expect(deleted.status).toBe(200);
        expect(await fileStatus(fileUrl)).toBe(404);
        expect((await fileRow(fileId)).deletedAt).not.toBeNull();
    });
});
