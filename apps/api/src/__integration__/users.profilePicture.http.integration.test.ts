import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import { PROFILE_PICTURE } from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// The profile picture over the real Express stack, against a real Postgres:
// upload, replace, remove, every refusal and the event the sockets listen to.
// Off unless INTEGRATION_DATABASE_URL points at a throwaway database different
// from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type Json = any;

describe.skipIf(!enabled)("profile picture over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");

    let ana: { id: string };
    let bruno: { id: string };

    const photo = (width: number, height: number) =>
        sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: 200, g: 30, b: 30 },
            },
        })
            .jpeg()
            .toBuffer();

    const call = async (
        as: { id: string } | null,
        method: string,
        route: string,
        form?: FormData
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(as)}`;
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: form,
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

    const upload = (as: { id: string } | null, bytes: Buffer) => {
        const form = new FormData();
        form.append(
            "file",
            new Blob([new Uint8Array(bytes)], { type: "image/jpeg" }),
            "photo.jpg"
        );
        return call(as, "PUT", "/users/me/profile-picture", form);
    };

    const fileStatus = async (fileUrl: string) =>
        (await fetch(`${baseUrl}${fileUrl}`)).status;

    const storedRow = async (userId: string) => {
        const { db, userProfilePicturesTable, eq } = database;
        const [row] = await db
            .select()
            .from(userProfilePicturesTable)
            .where(eq(userProfilePicturesTable.userId, userId));
        return row;
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        fs.mkdirSync(storageDir, { recursive: true });
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable } = database;
        const make = async (key: string) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@picture.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            return row;
        };
        ana = await make("ana");
        bruno = await make("bruno");

        server = http.createServer(createApp());
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    it("asks for a signed in user", async () => {
        expect((await upload(null, await photo(100, 100))).status).toBe(401);
        expect(
            (await call(null, "DELETE", "/users/me/profile-picture")).status
        ).toBe(401);
    });

    it("starts with no picture", async () => {
        const validate = await call(ana, "GET", "/auth/validate");

        expect(validate.body.user.profilePictureUrl).toBeNull();
    });

    it("uploads a big phone photo as a 256 x 256 PNG and serves it", async () => {
        const heard: unknown[] = [];
        const stop = core.UserService.onProfilePictureChanged((change) => {
            heard.push(change);
        });

        const response = await upload(ana, await photo(4000, 3000));
        stop();

        expect(response.status).toBe(200);
        expect(response.body.user.profilePictureUrl).toMatch(/^\/files\//);
        expect(heard).toEqual([
            {
                userId: ana.id,
                profilePictureUrl: response.body.user.profilePictureUrl,
            },
        ]);

        const file = await fetch(
            `${baseUrl}${response.body.user.profilePictureUrl}`
        );
        expect(file.status).toBe(200);
        const meta = await sharp(
            Buffer.from(await file.arrayBuffer())
        ).metadata();
        expect(meta.format).toBe("png");
        expect([meta.width, meta.height]).toEqual([
            PROFILE_PICTURE.outputSize,
            PROFILE_PICTURE.outputSize,
        ]);
    });

    it("answers the picture on /auth/validate and keeps the others without one", async () => {
        const mine = await call(ana, "GET", "/auth/validate");
        const theirs = await call(bruno, "GET", "/auth/validate");

        expect(mine.body.user.profilePictureUrl).toMatch(/^\/files\//);
        expect(theirs.body.user.profilePictureUrl).toBeNull();
    });

    it("replaces the picture and deletes the old file", async () => {
        const before = (await storedRow(ana.id))!;
        const oldUrl = `/files/${before.fileId}`;

        const response = await upload(ana, await photo(300, 300));

        expect(response.status).toBe(200);
        expect(response.body.user.profilePictureUrl).not.toBe(oldUrl);
        expect(await fileStatus(oldUrl)).toBe(404);
        expect(await fileStatus(response.body.user.profilePictureUrl)).toBe(
            200
        );
        expect((await storedRow(ana.id))!.fileId).not.toBe(before.fileId);
    });

    it("refuses what is not an image, keeping the current picture", async () => {
        const before = (await storedRow(ana.id))!;

        const response = await upload(ana, Buffer.from("just some text"));

        expect(response.status).toBe(422);
        expect(response.body.code).toBe("PROFILE_PICTURE_INVALID");
        expect((await storedRow(ana.id))!.fileId).toBe(before.fileId);
        expect(await fileStatus(`/files/${before.fileId}`)).toBe(200);
    });

    it("refuses an image whose shorter side is under the minimum", async () => {
        const response = await upload(
            ana,
            await photo(500, PROFILE_PICTURE.minSide - 1)
        );

        expect(response.status).toBe(422);
    });

    it("refuses a file over 5 MB with 413", async () => {
        const response = await upload(
            ana,
            Buffer.alloc(PROFILE_PICTURE.maxBytes + 1)
        );

        expect(response.status).toBe(413);
        expect(response.body.code).toBe("PROFILE_PICTURE_TOO_LARGE");
    });

    it("refuses a request with no file with 415", async () => {
        const form = new FormData();

        const response = await call(
            ana,
            "PUT",
            "/users/me/profile-picture",
            form
        );

        expect(response.status).toBe(415);
        expect(response.body.code).toBe("PROFILE_PICTURE_UNSUPPORTED_MEDIA");
    });

    it("does not touch the avatar sprite", async () => {
        const { db, userAvatarSheetsTable, eq } = database;
        const sheets = () =>
            db
                .select()
                .from(userAvatarSheetsTable)
                .where(eq(userAvatarSheetsTable.userId, ana.id));
        const before = await sheets();

        await upload(ana, await photo(120, 120));
        await call(ana, "DELETE", "/users/me/profile-picture");

        expect(await sheets()).toEqual(before);
    });

    it("removes the picture and its file", async () => {
        await upload(ana, await photo(100, 100));
        const row = (await storedRow(ana.id))!;

        const response = await call(ana, "DELETE", "/users/me/profile-picture");

        expect(response.status).toBe(200);
        expect(response.body.user.profilePictureUrl).toBeNull();
        expect(await storedRow(ana.id)).toBeUndefined();
        expect(await fileStatus(`/files/${row.fileId}`)).toBe(404);
    });

    it("removes again without an error", async () => {
        const response = await call(ana, "DELETE", "/users/me/profile-picture");

        expect(response.status).toBe(200);
        expect(response.body.user.profilePictureUrl).toBeNull();
    });

    it("keeps one picture and no orphan when two first uploads race", async () => {
        const { db, usersTable, filesTable, and, isNull, like } = database;
        const [carla] = await db
            .insert(usersTable)
            .values({
                name: "carla",
                email: `carla-${RUN}@picture.dev`,
                password: "x",
                role: "USER",
            })
            .returning({ id: usersTable.id });
        const bytes = await photo(200, 200);

        const results = await Promise.all(
            Array.from({ length: 8 }, () => upload(carla, bytes))
        );

        expect(results.map(({ status }) => status)).toEqual(Array(8).fill(200));
        const live = await db
            .select({ id: filesTable.id })
            .from(filesTable)
            .where(
                and(
                    like(
                        filesTable.fileName,
                        `users/${carla.id}/profile-picture/%`
                    ),
                    isNull(filesTable.deletedAt)
                )
            );
        const row = (await storedRow(carla.id))!;
        expect(live).toEqual([{ id: row.fileId }]);
    });
});
