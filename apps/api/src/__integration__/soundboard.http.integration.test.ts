import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildMp3 } from "./helpers/mp3";

// Exercises the soundboard routes over the real Express stack (auth,
// membership, multer, controllers, error mapping) against a real Postgres. Off
// unless INTEGRATION_DATABASE_URL points at a throwaway database different from
// the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Database = typeof import("@standin/database");
type UserKey = "admin" | "owner" | "member" | "other" | "outsider";
type Json = any;

describe.skipIf(!enabled)("soundboard over HTTP (real stack)", () => {
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string }>;
    let organizationId: string;
    let otherOrganizationId: string;

    const call = async (
        as: UserKey,
        method: string,
        route: string,
        body?: unknown,
        raw?: FormData
    ) => {
        const headers: Record<string, string> = {
            cookie: `token=${createToken(users[as])}`,
        };
        if (body !== undefined) headers["content-type"] = "application/json";
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body:
                raw ?? (body === undefined ? undefined : JSON.stringify(body)),
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

    const form = (
        name: string | undefined,
        file?: Buffer,
        type = "audio/mpeg",
        extra: Record<string, string> = {}
    ) => {
        const body = new FormData();
        if (name !== undefined) body.append("name", name);
        Object.entries(extra).forEach(([key, value]) =>
            body.append(key, value)
        );
        if (file) {
            body.append(
                "file",
                new Blob([new Uint8Array(file)], { type }),
                "clip.mp3"
            );
        }
        return body;
    };

    const clips = (id = () => organizationId) =>
        `/organizations/${id()}/soundboard/clips`;
    const upload = (as: UserKey, name: string, file = buildMp3(40)) =>
        call(as, "POST", clips(), undefined, form(name, file));
    const names = (page: Json) =>
        (page.clips as { name: string }[]).map(({ name }) => name);

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        database = await import("@standin/database");
        const core = await import("@standin/core");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;
        const make = async (key: UserKey, role: "ADMIN" | "USER") => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@soundboard.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");
        await make("other", "USER");
        await make("outsider", "USER");

        organizationId = (
            await core.OrganizationService.create(users.owner.id, {
                name: "Soundboard Org",
            })
        ).id;
        otherOrganizationId = (
            await core.OrganizationService.create(users.outsider.id, {
                name: "Other Org",
            })
        ).id;
        await db.insert(organizationMembersTable).values([
            { userId: users.member.id, organizationId, role: "MEMBER" },
            { userId: users.other.id, organizationId, role: "MEMBER" },
        ]);

        server = http.createServer(createApp());
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("upload", () => {
        it("lets any member upload and measures the duration itself", async () => {
            const response = await upload("member", "Aplausos");

            expect(response.status).toBe(201);
            expect(response.body.clip).toMatchObject({
                name: "Aplausos",
                scope: "ORGANIZATION",
                canManage: true,
                durationMs: 1045,
            });
            expect(response.body.clip.fileUrl).toMatch(/^\/files\//);
        });

        it("refuses a person who is not a member", async () => {
            const response = await call(
                "outsider",
                "POST",
                clips(),
                undefined,
                form("Intruso", buildMp3(40))
            );

            expect(response.status).toBe(403);
        });

        it("rejects a name already used in the organization", async () => {
            await upload("member", "Repetido");

            const again = await upload("other", "Repetido");

            expect(again.status).toBe(409);
            expect(again.body.code ?? again.body.error).toBeDefined();
        });

        it("allows the same name in another organization", async () => {
            const response = await call(
                "outsider",
                "POST",
                clips(() => otherOrganizationId),
                undefined,
                form("Repetido", buildMp3(40))
            );

            expect(response.status).toBe(201);
        });

        it.each([
            ["a file with no name", undefined, buildMp3(40), "audio/mpeg", 422],
            ["a blank name", "   ", buildMp3(40), "audio/mpeg", 422],
            ["no file", "Sem arquivo", undefined, "audio/mpeg", 400],
            ["a wrong type", "Wav", buildMp3(40), "audio/wav", 415],
            [
                "bytes that are not mp3",
                "Lixo",
                Buffer.alloc(3000),
                "audio/mpeg",
                415,
            ],
            ["a clip too short", "Curto", buildMp3(2), "audio/mpeg", 422],
            ["a clip over 10 s", "Longo", buildMp3(400), "audio/mpeg", 422],
        ] as const)("rejects %s", async (_label, name, file, type, status) => {
            const response = await call(
                "member",
                "POST",
                clips(),
                undefined,
                form(name, file as Buffer | undefined, type)
            );

            expect(response.status).toBe(status);
        });

        it("rejects a file over 512 KB at the door", async () => {
            const response = await upload(
                "member",
                "Grande",
                Buffer.alloc(600_000)
            );

            expect(response.status).toBe(413);
        });

        it("has no limit on the number of clips", async () => {
            const sent = await Promise.all(
                Array.from({ length: 12 }, (_, index) =>
                    upload("owner", `Muitos ${index}`)
                )
            );

            expect(sent.every(({ status }) => status === 201)).toBe(true);
        });
    });

    describe("icon and volume", () => {
        const withExtra = (name: string, extra: Record<string, string>) =>
            call(
                "member",
                "POST",
                clips(),
                undefined,
                form(name, buildMp3(40), "audio/mpeg", extra)
            );

        it("defaults to no icon and the full volume", async () => {
            const { body } = await upload("member", "Sem extras");

            expect(body.clip).toMatchObject({ icon: null, volume: 1 });
        });

        it("stores the icon and the volume sent with the file", async () => {
            const { status, body } = await withExtra("Com extras", {
                icon: "🔥",
                volume: "0.4",
            });

            expect(status).toBe(201);
            expect(body.clip).toMatchObject({ icon: "🔥", volume: 0.4 });
        });

        it.each([
            ["an emoji that is text", { icon: "ab" }],
            ["two emojis", { icon: "🔥🔥" }],
            ["a volume above 1", { volume: "1.5" }],
            ["a negative volume", { volume: "-0.2" }],
            ["a volume that is not a number", { volume: "alto" }],
        ])("rejects %s", async (_label, extra) => {
            const response = await withExtra(`Invalido ${_label}`, extra);

            expect(response.status).toBe(422);
        });

        it("updates the icon and the volume, and clears the icon", async () => {
            const { body } = await upload("member", "Para ajustar");
            const route = `${clips()}/${body.clip.id}`;

            const set = await call("member", "PATCH", route, {
                icon: "🎉",
                volume: 0.25,
            });
            expect(set.body.clip).toMatchObject({
                name: "Para ajustar",
                icon: "🎉",
                volume: 0.25,
            });

            const cleared = await call("member", "PATCH", route, {
                icon: null,
            });
            expect(cleared.body.clip).toMatchObject({
                icon: null,
                volume: 0.25,
            });
        });

        it("refuses an empty update and a bad volume", async () => {
            const { body } = await upload("member", "Para falhar");
            const route = `${clips()}/${body.clip.id}`;

            expect((await call("member", "PATCH", route, {})).status).toBe(422);
            expect(
                (await call("member", "PATCH", route, { volume: 3 })).status
            ).toBe(422);
        });

        it("keeps who may change a clip: a member cannot touch another's", async () => {
            const { body } = await upload("member", "Do outro membro");
            const route = `${clips()}/${body.clip.id}`;

            const response = await call("other", "PATCH", route, {
                volume: 0,
            });

            expect(response.status).toBe(403);
        });
    });

    describe("list", () => {
        it("pages, filters by name and reports the total", async () => {
            const first = await call(
                "member",
                "GET",
                `${clips()}?scope=ORGANIZATION&search=muitos&pageSize=5`
            );
            const last = await call(
                "member",
                "GET",
                `${clips()}?scope=ORGANIZATION&search=muitos&pageSize=5&page=3`
            );

            expect(first.status).toBe(200);
            expect(first.body.total).toBe(12);
            expect(first.body.clips).toHaveLength(5);
            expect(last.body.clips).toHaveLength(2);
            expect(names(first.body).every((n) => n.startsWith("Muitos"))).toBe(
                true
            );
        });

        it("treats % and _ in the search as plain characters", async () => {
            const response = await call(
                "member",
                "GET",
                `${clips()}?search=%25`
            );

            expect(response.body.total).toBe(0);
        });

        it("does not show the clips of another organization", async () => {
            const response = await call(
                "outsider",
                "GET",
                `${clips(() => otherOrganizationId)}?scope=ORGANIZATION`
            );

            expect(response.body.clips).toHaveLength(1);
            expect(names(response.body)).toEqual(["Repetido"]);
        });

        it("refuses a person who is not a member", async () => {
            expect((await call("outsider", "GET", clips())).status).toBe(403);
        });
    });

    describe("rename and delete", () => {
        it("lets the uploader and the owner change a clip, and no one else", async () => {
            const { body } = await upload("member", "Do membro");
            const route = `${clips()}/${body.clip.id}`;

            expect(
                (await call("other", "PATCH", route, { name: "Roubo" })).status
            ).toBe(403);
            expect((await call("other", "DELETE", route)).status).toBe(403);
            expect(
                (await call("admin", "PATCH", route, { name: "Admin" })).status
            ).toBe(403);

            const renamed = await call("member", "PATCH", route, {
                name: " Novo nome ",
            });
            expect(renamed.status).toBe(200);
            expect(renamed.body.clip.name).toBe("Novo nome");

            const byOwner = await call("owner", "PATCH", route, {
                name: "Do dono",
            });
            expect(byOwner.status).toBe(200);
            expect(byOwner.body.clip.canManage).toBe(true);
        });

        it("refuses a rename to a taken or invalid name", async () => {
            const { body } = await upload("member", "Para renomear");
            const route = `${clips()}/${body.clip.id}`;

            expect(
                (await call("member", "PATCH", route, { name: "Repetido" }))
                    .status
            ).toBe(409);
            expect(
                (await call("member", "PATCH", route, { name: "" })).status
            ).toBe(422);
        });

        it("soft deletes: the clip leaves the list and cannot be found", async () => {
            const { body } = await upload("member", "Para apagar");
            const route = `${clips()}/${body.clip.id}`;

            expect((await call("member", "DELETE", route)).status).toBe(204);

            const list = await call(
                "member",
                "GET",
                `${clips()}?search=apagar`
            );
            expect(list.body.total).toBe(0);
            expect((await call("member", "DELETE", route)).status).toBe(404);

            const row = await database.db
                .select()
                .from(database.soundboardClipsTable)
                .where(
                    database.eq(database.soundboardClipsTable.id, body.clip.id)
                );
            expect(row[0]?.deletedAt).not.toBeNull();
        });

        it("frees the name of a deleted clip", async () => {
            const { body } = await upload("member", "Reutilizado");
            await call("member", "DELETE", `${clips()}/${body.clip.id}`);

            expect((await upload("member", "Reutilizado")).status).toBe(201);
        });

        it("cannot touch a clip of another organization", async () => {
            const { body } = await call(
                "outsider",
                "GET",
                `${clips(() => otherOrganizationId)}?scope=ORGANIZATION`
            );
            const foreign = body.clips[0].id;

            const response = await call(
                "owner",
                "DELETE",
                `${clips()}/${foreign}`
            );

            expect(response.status).toBe(404);
        });
    });

    describe("default clips", () => {
        const defaults = "/soundboard/default-clips";

        it("are managed by the platform admin only", async () => {
            for (const as of ["owner", "member"] as const) {
                expect((await call(as, "GET", defaults)).status).toBe(403);
                expect(
                    (
                        await call(
                            as,
                            "POST",
                            defaults,
                            undefined,
                            form(`Padrao ${RUN}`, buildMp3(40))
                        )
                    ).status
                ).toBe(403);
            }

            const created = await call(
                "admin",
                "POST",
                defaults,
                undefined,
                form(`Padrao ${RUN}`, buildMp3(40))
            );
            expect(created.status).toBe(201);
            expect(created.body.clip).toMatchObject({
                scope: "DEFAULT",
                canManage: true,
            });

            const renamed = await call(
                "admin",
                "PATCH",
                `${defaults}/${created.body.clip.id}`,
                { name: `Padrão 2 ${RUN}` }
            );
            expect(renamed.status).toBe(200);
        });

        it("show up for every member, who cannot change them", async () => {
            const response = await call(
                "member",
                "GET",
                `${clips()}?scope=DEFAULT`
            );

            expect(response.body.total).toBeGreaterThanOrEqual(1);
            const clip = response.body.clips[0];
            expect(clip.scope).toBe("DEFAULT");
            expect(clip.canManage).toBe(false);

            const route = `${clips()}/${clip.id}`;
            expect((await call("member", "DELETE", route)).status).toBe(403);
            expect(
                (await call("owner", "PATCH", route, { name: "x" })).status
            ).toBe(403);
        });

        it("list together with the organization clips when no scope is given", async () => {
            const response = await call(
                "member",
                "GET",
                `${clips()}?pageSize=100`
            );
            const scopes = new Set(
                (response.body.clips as { scope: string }[]).map(
                    ({ scope }) => scope
                )
            );

            expect(scopes).toEqual(new Set(["ORGANIZATION", "DEFAULT"]));
        });

        it("lets the admin delete one, which then disappears for everyone", async () => {
            const created = await call(
                "admin",
                "POST",
                defaults,
                undefined,
                form(`Efemero ${RUN}`, buildMp3(40))
            );
            const id = created.body.clip.id;

            expect(
                (await call("admin", "DELETE", `${defaults}/${id}`)).status
            ).toBe(204);

            const list = await call(
                "member",
                "GET",
                `${clips()}?search=efemero%20${RUN}`
            );
            expect(list.body.total).toBe(0);
        });
    });
});
