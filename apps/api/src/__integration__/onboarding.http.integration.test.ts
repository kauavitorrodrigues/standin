import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// The onboarding progress over the real Express stack, against a real
// Postgres: marking twice, two people, a key that is not a task, a task that
// was retired and a deleted account. Off unless INTEGRATION_DATABASE_URL
// points at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type UserKey = "ana" | "bruno" | "gone";
type Json = any;

describe.skipIf(!enabled)("onboarding over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string }>;

    const call = async (as: UserKey | null, method: string, route: string) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
        });
        const text = await response.text();
        const body: Json = text ? JSON.parse(text) : null;
        return { status: response.status, body };
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

        const { db, usersTable } = database;
        const make = async (key: UserKey) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@onboarding.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id };
        };
        await make("ana");
        await make("bruno");
        await make("gone");

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
        expect((await call(null, "GET", "/onboarding")).status).toBe(401);
        expect(
            (await call(null, "PUT", "/onboarding/tasks/claim-desk")).status
        ).toBe(401);
    });

    it("starts with no task completed", async () => {
        const response = await call("ana", "GET", "/onboarding");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ tasks: {} });
    });

    it("marks a task and lists it", async () => {
        const marked = await call("ana", "PUT", "/onboarding/tasks/claim-desk");

        expect(marked.status).toBe(200);
        expect(Object.keys(marked.body.tasks)).toEqual(["claim-desk"]);

        const listed = await call("ana", "GET", "/onboarding");
        expect(listed.body).toEqual(marked.body);
    });

    it("keeps the first completedAt when it is marked twice", async () => {
        const first = await call("ana", "PUT", "/onboarding/tasks/hang-out");
        await new Promise((resolve) => setTimeout(resolve, 20));
        const second = await call("ana", "PUT", "/onboarding/tasks/hang-out");

        expect(second.status).toBe(200);
        expect(second.body.tasks["hang-out"]).toEqual(
            first.body.tasks["hang-out"]
        );
    });

    it("keeps one entry when the same task is marked at once", async () => {
        const responses = await Promise.all(
            Array.from({ length: 5 }, () =>
                call("bruno", "PUT", "/onboarding/tasks/navigate-office")
            )
        );

        expect(responses.every(({ status }) => status === 200)).toBe(true);
        const stamps = new Set(
            responses.map(
                ({ body }) => body.tasks["navigate-office"].completedAt
            )
        );
        expect(stamps.size).toBe(1);
    });

    it("keeps the progress of each person apart", async () => {
        const ana = await call("ana", "GET", "/onboarding");
        const bruno = await call("bruno", "GET", "/onboarding");

        expect(Object.keys(ana.body.tasks).sort()).toEqual([
            "claim-desk",
            "hang-out",
        ]);
        expect(Object.keys(bruno.body.tasks)).toEqual(["navigate-office"]);
    });

    it("answers 400 for a key that is not a task", async () => {
        const response = await call("ana", "PUT", "/onboarding/tasks/dance");

        expect(response.status).toBe(400);
        expect(response.body.code).toBe("UNKNOWN_ONBOARDING_TASK");
    });

    it("drops a task that was retired when reading", async () => {
        const { db, usersTable, eq } = database;
        await db
            .update(usersTable)
            .set({
                onboardingTasks: {
                    retired: { completedAt: "2026-11-04T10:00:00.000Z" },
                    "claim-desk": { completedAt: "2026-11-04T10:00:00.000Z" },
                } as never,
            })
            .where(eq(usersTable.id, users.bruno.id));

        const response = await call("bruno", "GET", "/onboarding");

        expect(response.body).toEqual({
            tasks: {
                "claim-desk": { completedAt: "2026-11-04T10:00:00.000Z" },
            },
        });
    });

    it("does not read or mark the progress of a deleted account", async () => {
        const { db, usersTable, eq } = database;
        await db
            .update(usersTable)
            .set({ deletedAt: new Date() })
            .where(eq(usersTable.id, users.gone.id));

        await expect(
            core.OnboardingService.get(users.gone.id)
        ).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
        await expect(
            core.OnboardingService.markTask(users.gone.id, "claim-desk")
        ).rejects.toMatchObject({ code: "USER_NOT_FOUND" });
    });
});
