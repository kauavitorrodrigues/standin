import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import { io as connectClient } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Sign in with GitHub over the real Express stack and a real Postgres. GitHub
// itself is a fake: every request to its hosts is answered here, and anything
// else (the app under test) goes through the real fetch. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");

type FakeAccount = {
    id: number;
    login: string;
    name: string | null;
    emails: { email: string; primary: boolean; verified: boolean }[];
    avatar: "ok" | "broken";
    // Slows the e-mail answer, so two sign ins of one account overlap.
    slow?: boolean;
};

describe.skipIf(!enabled)("sign in with GitHub (real stack)", () => {
    let core: Core;
    let database: Database;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    const realFetch = globalThis.fetch;

    const codes = new Map<string, FakeAccount>();
    let githubCalls: string[] = [];
    let counter = 0;

    const fakeId = () => Date.now() * 1000 + ++counter;

    const account = (overrides: Partial<FakeAccount> = {}): FakeAccount => {
        const id = fakeId();
        return {
            id,
            login: `octo-${RUN}-${id}`,
            name: "Octo Cat",
            emails: [
                {
                    email: `octo-${id}-${RUN}@github.dev`,
                    primary: true,
                    verified: true,
                },
            ],
            avatar: "ok",
            ...overrides,
        };
    };

    const png = () =>
        sharp({
            create: {
                width: 300,
                height: 200,
                channels: 3,
                background: { r: 20, g: 120, b: 60 },
            },
        })
            .png()
            .toBuffer();

    const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), {
            status,
            headers: { "content-type": "application/json" },
        });

    const fakeFetch = async (
        input: string | URL | Request,
        init?: RequestInit
    ): Promise<Response> => {
        const target = new URL(
            typeof input === "string" || input instanceof URL
                ? input
                : input.url
        );
        const headers = new Headers(init?.headers);

        switch (target.host) {
            case "github.com": {
                githubCalls.push(`${target.host}${target.pathname}`);
                const { code } = JSON.parse(String(init?.body));
                return codes.has(code)
                    ? json({ access_token: `tok:${code}` })
                    : json({ error: "bad_verification_code" });
            }
            case "api.github.com": {
                githubCalls.push(`${target.host}${target.pathname}`);
                const code = (headers.get("authorization") ?? "").slice(
                    "Bearer tok:".length
                );
                const found = codes.get(code);
                if (!found) return json({ message: "Bad credentials" }, 401);

                if (target.pathname === "/user") {
                    return json({
                        id: found.id,
                        login: found.login,
                        name: found.name,
                        avatar_url: `https://avatars.githubusercontent.com/u/${found.id}?v=4`,
                        email: "untrusted@example.com",
                    });
                }
                if (found.slow) await new Promise((r) => setTimeout(r, 150));
                return json(found.emails);
            }
            case "avatars.githubusercontent.com": {
                githubCalls.push(`${target.host}${target.pathname}`);
                const found = [...codes.values()].find(
                    ({ id }) => target.pathname === `/u/${id}`
                );
                if (found?.avatar !== "ok") {
                    return new Response("nope", { status: 500 });
                }
                return new Response(new Uint8Array(await png()), {
                    status: 200,
                });
            }
            default:
                return realFetch(input, init);
        }
    };

    const cookieOf = (response: Response, name: string) =>
        response.headers
            .getSetCookie()
            .find((cookie) => cookie.startsWith(`${name}=`))
            ?.split(";")[0];

    // A whole sign in: the start route, then the callback GitHub would call.
    const signIn = async (
        who: FakeAccount,
        overrides: { state?: string; code?: string } = {}
    ) => {
        const code = overrides.code ?? `code-${RUN}-${fakeId()}`;
        if (!overrides.code) codes.set(code, who);

        const start = await realFetch(`${baseUrl}/auth/github`, {
            redirect: "manual",
        });
        const oauthCookie = cookieOf(start, "oauth_github");
        const state = new URL(start.headers.get("location")!).searchParams.get(
            "state"
        )!;

        const callback = await realFetch(
            `${baseUrl}/auth/github/callback?${new URLSearchParams({
                code,
                state: overrides.state ?? state,
            })}`,
            {
                redirect: "manual",
                headers: oauthCookie ? { cookie: oauthCookie } : {},
            }
        );
        const location = callback.headers.get("location")!;

        return {
            status: callback.status,
            location,
            error: new URL(location).searchParams.get("error"),
            token: cookieOf(callback, "token"),
            start,
        };
    };

    const call = async (
        method: string,
        route: string,
        options: { cookie?: string; body?: unknown } = {}
    ) => {
        const response = await realFetch(`${baseUrl}${route}`, {
            method,
            headers: {
                ...(options.cookie ? { cookie: options.cookie } : {}),
                ...(options.body ? { "content-type": "application/json" } : {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        const text = await response.text();
        let parsed: any = null;
        try {
            parsed = text ? JSON.parse(text) : null;
        } catch {
            parsed = text;
        }
        return { status: response.status, body: parsed };
    };

    const identitiesOf = async (providerUserId: string) => {
        const { db, userIdentitiesTable, eq } = database;
        return db
            .select()
            .from(userIdentitiesTable)
            .where(eq(userIdentitiesTable.providerUserId, providerUserId));
    };

    const userRow = async (id: string) => {
        const { db, usersTable, eq } = database;
        const [row] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id));
        return row;
    };

    const usersWithEmail = async (email: string) => {
        const { db, usersTable, eq } = database;
        return db.select().from(usersTable).where(eq(usersTable.email, email));
    };

    const pictureRow = async (userId: string) => {
        const { db, userProfilePicturesTable, eq } = database;
        const [row] = await db
            .select()
            .from(userProfilePicturesTable)
            .where(eq(userProfilePicturesTable.userId, userId));
        return row;
    };

    const sheetRows = async (userId: string) => {
        const { db, userAvatarSheetsTable, eq } = database;
        return db
            .select()
            .from(userAvatarSheetsTable)
            .where(eq(userAvatarSheetsTable.userId, userId));
    };

    const userIdOfSession = async (token: string) => {
        const validate = await call("GET", "/auth/validate", {
            cookie: token,
        });
        return validate.body?.user?.id as string | undefined;
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.env.GITHUB_CLIENT_ID = "Iv1.integration";
        process.env.GITHUB_CLIENT_SECRET = "integration-secret-value";
        process.env.GITHUB_CALLBACK_URL =
            "http://localhost:3000/auth/github/callback";
        fs.mkdirSync(storageDir, { recursive: true });
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        const { createSocketServer } =
            await import("@/lib/socket/createSocketServer");

        globalThis.fetch = fakeFetch as typeof fetch;

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        globalThis.fetch = realFetch;
        await new Promise((resolve) => server?.close(resolve));
    });

    it("lists the provider as on, and the routes as 404 when it is off", async () => {
        expect((await call("GET", "/auth/providers")).body).toEqual({
            github: true,
        });

        const secret = process.env.GITHUB_CLIENT_SECRET;
        delete process.env.GITHUB_CLIENT_SECRET;
        try {
            expect((await call("GET", "/auth/providers")).body).toEqual({
                github: false,
            });
            const start = await realFetch(`${baseUrl}/auth/github`, {
                redirect: "manual",
            });
            expect(start.status).toBe(404);
            const callback = await realFetch(
                `${baseUrl}/auth/github/callback?code=x&state=y`,
                { redirect: "manual" }
            );
            expect(callback.status).toBe(404);
        } finally {
            process.env.GITHUB_CLIENT_SECRET = secret;
        }
    });

    it("sends the person to GitHub with state and a PKCE challenge", async () => {
        const start = await realFetch(`${baseUrl}/auth/github`, {
            redirect: "manual",
        });
        const target = new URL(start.headers.get("location")!);

        expect(start.status).toBe(302);
        expect(`${target.origin}${target.pathname}`).toBe(
            "https://github.com/login/oauth/authorize"
        );
        expect(target.searchParams.get("client_id")).toBe("Iv1.integration");
        expect(target.searchParams.get("redirect_uri")).toBe(
            "http://localhost:3000/auth/github/callback"
        );
        expect(target.searchParams.get("code_challenge")).toBeTruthy();
        const setCookie = start.headers.getSetCookie().join(";");
        expect(setCookie).toContain("oauth_github=");
        expect(setCookie).toContain("HttpOnly");
        expect(setCookie).not.toContain("integration-secret-value");
    });

    it("creates a new person with the GitHub name, e-mail and photo, and no password", async () => {
        const octo = account();
        const email = octo.emails[0].email;

        const result = await signIn(octo);

        expect(result.status).toBe(302);
        expect(result.location).toBe("http://localhost:5173/");
        expect(result.token).toBeTruthy();

        const id = (await userIdOfSession(result.token!))!;
        const row = await userRow(id);
        expect(row.name).toBe("Octo Cat");
        expect(row.email).toBe(email);
        expect(row.password).toBeNull();

        const identities = await identitiesOf(String(octo.id));
        expect(identities).toHaveLength(1);
        expect(identities[0]).toMatchObject({
            userId: id,
            provider: "github",
            providerLogin: octo.login,
        });

        const validate = await call("GET", "/auth/validate", {
            cookie: result.token,
        });
        expect(validate.body.user.profilePictureUrl).toMatch(/^\/files\//);
        expect(validate.body.user).not.toHaveProperty("password");
        const photo = await realFetch(
            `${baseUrl}${validate.body.user.profilePictureUrl}`
        );
        const meta = await sharp(
            Buffer.from(await photo.arrayBuffer())
        ).metadata();
        expect([meta.format, meta.width, meta.height]).toEqual([
            "png",
            256,
            256,
        ]);
    });

    it("uses the login when the GitHub name is empty", async () => {
        const octo = account({ name: null });

        const result = await signIn(octo);

        const row = await userRow((await userIdOfSession(result.token!))!);
        expect(row.name).toBe(octo.login);
    });

    it("keeps the session on the socket: the cookie authenticates the handshake", async () => {
        const result = await signIn(account());

        const socket = connectClient(baseUrl, {
            transports: ["websocket"],
            forceNew: true,
            extraHeaders: { cookie: result.token! },
        });
        try {
            await new Promise<void>((resolve, reject) => {
                socket.once("connect", () => resolve());
                socket.once("connect_error", reject);
            });
            expect(socket.connected).toBe(true);
        } finally {
            socket.close();
        }

        const anonymous = connectClient(baseUrl, {
            transports: ["websocket"],
            forceNew: true,
        });
        try {
            await new Promise<void>((resolve) => {
                anonymous.once("connect_error", () => resolve());
            });
            expect(anonymous.connected).toBe(false);
        } finally {
            anonymous.close();
        }
    });

    it("signs the same person in again without asking GitHub for the e-mail or touching the photo", async () => {
        const octo = account();
        const first = await signIn(octo);
        const id = (await userIdOfSession(first.token!))!;
        const picture = await pictureRow(id);
        githubCalls = [];

        // GitHub changed the e-mail and the name since: nothing changes here.
        octo.emails = [
            { email: "changed@github.dev", primary: true, verified: false },
        ];
        octo.name = "Changed Name";
        const second = await signIn(octo);

        expect(second.error).toBeNull();
        expect(await userIdOfSession(second.token!)).toBe(id);
        expect(githubCalls).not.toContain("api.github.com/user/emails");
        expect(githubCalls.some((c) => c.startsWith("avatars."))).toBe(false);
        expect((await userRow(id)).name).toBe("Octo Cat");
        expect(await pictureRow(id)).toEqual(picture);
        expect(await identitiesOf(String(octo.id))).toHaveLength(1);
    });

    it("links to a person with the same verified e-mail and keeps everything of theirs", async () => {
        const octo = account();
        const email = octo.emails[0].email;
        const existing = await core.UserService.create({
            name: "Pessoa Antiga",
            email: email.toUpperCase(),
            password: "Strong-Password-123!",
        });
        const file = await core.FileService.upload(
            {
                buffer: await png(),
                originalname: "sheet.png",
                mimetype: "image/png",
                size: 1,
            },
            { folder: `integration/github/${RUN}` }
        );
        const { db, userAvatarSheetsTable } = database;
        await db
            .delete(userAvatarSheetsTable)
            .where(database.eq(userAvatarSheetsTable.userId, existing.id));
        await db.insert(userAvatarSheetsTable).values({
            userId: existing.id,
            fileId: file.id,
            configHash: "a".repeat(64),
        });
        const picture = await core.UserService.updateProfilePicture(
            existing.id,
            {
                action: "set",
                file: {
                    buffer: await sharp({
                        create: {
                            width: 256,
                            height: 256,
                            channels: 3,
                            background: { r: 200, g: 0, b: 0 },
                        },
                    })
                        .png()
                        .toBuffer(),
                    originalname: "profile-picture.png",
                    mimetype: "image/png",
                    size: 1,
                },
            }
        );
        const sheetsBefore = await sheetRows(existing.id);
        const pictureBefore = await pictureRow(existing.id);
        expect(sheetsBefore).toHaveLength(1);
        githubCalls = [];

        const result = await signIn(octo);

        expect(result.error).toBeNull();
        expect(await userIdOfSession(result.token!)).toBe(existing.id);
        const identities = await identitiesOf(String(octo.id));
        expect(identities.map(({ userId }) => userId)).toEqual([existing.id]);
        // The sprite, the photo, the name and the password stay as they were.
        expect(await sheetRows(existing.id)).toEqual(sheetsBefore);
        expect(await pictureRow(existing.id)).toEqual(pictureBefore);
        expect(picture.profilePictureUrl).toBeTruthy();
        const row = await userRow(existing.id);
        expect(row.name).toBe("Pessoa Antiga");
        expect(row.password).toBeTruthy();
        // The person already had a photo, so GitHub's is not even downloaded.
        expect(githubCalls.some((c) => c.startsWith("avatars."))).toBe(false);

        // And the password still works.
        const signin = await call("POST", "/auth/signin", {
            body: { email, password: "Strong-Password-123!" },
        });
        expect(signin.status).toBe(200);
    });

    it("imports the photo on link only when the person has none", async () => {
        const octo = account();
        const existing = await core.UserService.create({
            name: "No Photo",
            email: octo.emails[0].email,
            password: "Strong-Password-123!",
        });
        expect(await pictureRow(existing.id)).toBeUndefined();

        await signIn(octo);

        expect(await pictureRow(existing.id)).toBeDefined();
    });

    it("never links by an e-mail GitHub did not verify", async () => {
        const octo = account();
        octo.emails[0].verified = false;
        const victim = await core.UserService.create({
            name: "Vitima",
            email: octo.emails[0].email,
            password: "Strong-Password-123!",
        });

        const result = await signIn(octo);

        expect(result.error).toBe("github_email_unverified");
        expect(result.token).toBeUndefined();
        expect(await identitiesOf(String(octo.id))).toHaveLength(0);
        expect(await userRow(victim.id)).toMatchObject({ name: "Vitima" });
    });

    it("refuses a new person whose primary e-mail is not verified, creating nothing", async () => {
        const octo = account({
            emails: [
                {
                    email: `nv-${RUN}@github.dev`,
                    primary: true,
                    verified: false,
                },
                {
                    email: `other-${RUN}@github.dev`,
                    primary: false,
                    verified: true,
                },
            ],
        });

        const result = await signIn(octo);

        expect(result.error).toBe("github_email_unverified");
        expect(await usersWithEmail(`nv-${RUN}@github.dev`)).toHaveLength(0);
        expect(await usersWithEmail(`other-${RUN}@github.dev`)).toHaveLength(0);
        expect(await identitiesOf(String(octo.id))).toHaveLength(0);
    });

    it("never reactivates a deleted person: the account starts a new one", async () => {
        const octo = account();
        const first = await signIn(octo);
        const oldId = (await userIdOfSession(first.token!))!;
        await core.UserService.delete(oldId);

        const second = await signIn(octo);

        expect(second.error).toBeNull();
        const newId = (await userIdOfSession(second.token!))!;
        expect(newId).not.toBe(oldId);
        expect((await userRow(oldId)).deletedAt).not.toBeNull();
        expect((await userRow(newId)).deletedAt).toBeNull();
        const identities = await identitiesOf(String(octo.id));
        expect(identities.map(({ userId }) => userId)).toEqual([newId]);
        // The session of the deleted person stopped working.
        expect(await userIdOfSession(first.token!)).toBeUndefined();
    });

    it("does not link to a deleted person with the same e-mail", async () => {
        const octo = account();
        const gone = await core.UserService.create({
            name: "Apagada",
            email: octo.emails[0].email,
            password: "Strong-Password-123!",
        });
        await core.UserService.delete(gone.id);

        const result = await signIn(octo);

        const id = (await userIdOfSession(result.token!))!;
        expect(id).not.toBe(gone.id);
        expect((await userRow(gone.id)).deletedAt).not.toBeNull();
    });

    it("creates one person when the same new account signs in twice at once", async () => {
        const octo = account({ slow: true });

        const [a, b] = await Promise.all([signIn(octo), signIn(octo)]);

        expect(a.error).toBeNull();
        expect(b.error).toBeNull();
        const ids = await Promise.all([
            userIdOfSession(a.token!),
            userIdOfSession(b.token!),
        ]);
        expect(ids[0]).toBe(ids[1]);
        expect(await identitiesOf(String(octo.id))).toHaveLength(1);
        expect(await usersWithEmail(octo.emails[0].email)).toHaveLength(1);
    });

    it("keeps one link when the same account links twice at once", async () => {
        const octo = account({ slow: true });
        const existing = await core.UserService.create({
            name: "Corrida",
            email: octo.emails[0].email,
            password: "Strong-Password-123!",
        });

        const [a, b] = await Promise.all([signIn(octo), signIn(octo)]);

        expect(a.error).toBeNull();
        expect(b.error).toBeNull();
        expect(await userIdOfSession(a.token!)).toBe(existing.id);
        expect(await userIdOfSession(b.token!)).toBe(existing.id);
        expect(await identitiesOf(String(octo.id))).toHaveLength(1);
    });

    it("signs in without a photo when the avatar download fails", async () => {
        const octo = account({ avatar: "broken" });

        const result = await signIn(octo);

        expect(result.error).toBeNull();
        const id = (await userIdOfSession(result.token!))!;
        expect(await pictureRow(id)).toBeUndefined();
    });

    it("refuses a callback with a state that is not the cookie one", async () => {
        const result = await signIn(account(), { state: "forged" });

        expect(result.error).toBe("oauth_state_invalid");
        expect(result.token).toBeUndefined();
    });

    it("refuses a callback with no cookie", async () => {
        const callback = await realFetch(
            `${baseUrl}/auth/github/callback?code=x&state=y`,
            { redirect: "manual" }
        );

        expect(
            new URL(callback.headers.get("location")!).searchParams.get("error")
        ).toBe("oauth_state_invalid");
    });

    it("sends oauth_exchange_failed when GitHub refuses the code", async () => {
        const result = await signIn(account(), { code: "unknown-code" });

        expect(result.error).toBe("oauth_exchange_failed");
        expect(result.token).toBeUndefined();
    });

    it("sends oauth_access_denied and creates nothing when the person cancels", async () => {
        const start = await realFetch(`${baseUrl}/auth/github`, {
            redirect: "manual",
        });
        const state = new URL(start.headers.get("location")!).searchParams.get(
            "state"
        )!;

        const callback = await realFetch(
            `${baseUrl}/auth/github/callback?${new URLSearchParams({
                error: "access_denied",
                state,
            })}`,
            {
                redirect: "manual",
                headers: { cookie: cookieOf(start, "oauth_github")! },
            }
        );

        expect(
            new URL(callback.headers.get("location")!).searchParams.get("error")
        ).toBe("oauth_access_denied");
    });

    it("keeps a GitHub-only person out of the password sign in and sign up", async () => {
        const octo = account();
        const email = octo.emails[0].email;
        await signIn(octo);

        const signin = await call("POST", "/auth/signin", {
            body: { email, password: "Strong-Password-123!" },
        });
        const signup = await call("POST", "/auth/signup", {
            body: { name: "Intruder", email, password: "Strong-Password-123!" },
        });

        expect(signin.status).toBe(401);
        expect(signup.status).toBe(409);
    });
});
