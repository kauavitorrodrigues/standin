import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Mentions over the real Express stack and the real socket server, against a
// real Postgres: who may be mentioned, what an edit notifies, and the current
// name of a renamed person. Off unless INTEGRATION_DATABASE_URL points at a
// throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Database = typeof import("@standin/database");
type UserKey = "owner" | "ana" | "bia" | "outsider";
type Json = any;
type Listener = Socket & { heard: { event: string; payload: Json }[] };

const link = (name: string, userId: string) => `[@${name}](mention:${userId})`;

describe.skipIf(!enabled)("chat mentions (real stack)", () => {
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<
        UserKey,
        { id: string; role: "USER"; name: string }
    >;
    let organizationId: string;
    let conversationId: string;
    let directId: string;
    const sockets: Socket[] = [];

    const call = async (
        as: UserKey,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {
            cookie: `token=${createToken(users[as])}`,
        };
        const withBody = body !== undefined;
        if (withBody) headers["content-type"] = "application/json";
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: withBody ? JSON.stringify(body) : undefined,
        });
        const text = await response.text();
        return {
            status: response.status,
            body: (text ? JSON.parse(text) : null) as Json,
        };
    };

    const chat = (route = "") =>
        `/organizations/${organizationId}/conversations${route}`;

    const send = (
        as: UserKey,
        content: string,
        inConversation = conversationId
    ) => call(as, "POST", chat(`/${inConversation}/messages`), { content });

    const edit = (as: UserKey, messageId: string, content: string) =>
        call(as, "PATCH", chat(`/${conversationId}/messages/${messageId}`), {
            content,
        });

    const listen = (as: UserKey): Promise<Listener> =>
        new Promise((resolve, reject) => {
            const socket = connectClient(baseUrl, {
                auth: { token: createToken(users[as]), channel: "app" },
                transports: ["websocket"],
                reconnection: false,
            }) as Listener;
            socket.heard = [];
            socket.onAny((event, payload) =>
                socket.heard.push({ event, payload })
            );
            sockets.push(socket);
            socket.on("connect", () => resolve(socket));
            socket.on("connect_error", reject);
        });

    const heardOf = (socket: Listener, event: string) =>
        socket.heard.filter((entry) => entry.event === event);

    const waitFor = async (check: () => boolean, ms = 2000) => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
            if (check()) return true;
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return check();
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        const core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        const { createSocketServer } =
            await import("@/lib/socket/createSocketServer");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;
        for (const key of ["owner", "ana", "bia", "outsider"] as const) {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@mentions.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role: "USER", name: key };
        }

        // A blank map needs the default floor, which the library seed brings.
        const [admin] = await db
            .insert(usersTable)
            .values({
                name: "admin",
                email: `admin-${RUN}@mentions.dev`,
                password: "x",
                role: "ADMIN",
            })
            .returning({ id: usersTable.id });
        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: admin.id }
        ).catch(() => undefined);

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Mentions Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values(
            (["ana", "bia"] as const).map((key) => ({
                userId: users[key].id,
                organizationId,
                role: "MEMBER" as const,
            }))
        );

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        const spaceResponse = await call(
            "owner",
            "POST",
            `/organizations/${organizationId}/spaces`,
            { name: "Mentions", sizeTier: "XS" }
        );
        expect(spaceResponse.status).toBe(201);

        const list = await call("owner", "GET", chat());
        conversationId = list.body.conversations.find(
            (conversation: Json) => conversation.type === "SPACE"
        ).id;

        const direct = await call("owner", "POST", chat("/direct"), {
            recipientUserIds: [users.ana.id],
        });
        directId = direct.body.conversation.id;
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    it("rejects a mention of a person who cannot access the conversation", async () => {
        const response = await send(
            "owner",
            `oi ${link("outsider", users.outsider.id)}`
        );
        expect(response.status).toBe(400);
    });

    it("rejects a mention of an id that is not a person", async () => {
        const response = await send("owner", `oi ${link("ninguem", "nope")}`);
        expect(response.status).toBe(400);
    });

    it("rejects a mention of the sender", async () => {
        const response = await send(
            "owner",
            `oi ${link("owner", users.owner.id)}`
        );
        expect(response.status).toBe(400);
    });

    it("rejects a mention in a direct conversation", async () => {
        const response = await send(
            "owner",
            `oi ${link("ana", users.ana.id)}`,
            directId
        );
        expect(response.status).toBe(400);
    });

    it("rejects a message that mentions more than the limit", async () => {
        const many = Array.from({ length: 21 }, (_, index) =>
            link(`p${index}`, `id-${index}`)
        ).join(" ");
        const response = await send("owner", many);
        expect(response.status).toBe(400);
    });

    it("stores the mention and tells only the mentioned person", async () => {
        const ana = await listen("ana");
        const bia = await listen("bia");

        const response = await send("owner", `oi ${link("ana", users.ana.id)}`);
        expect(response.status).toBe(201);
        expect(response.body.message.mentions).toEqual([
            { userId: users.ana.id, name: "ana" },
        ]);

        expect(
            await waitFor(
                () =>
                    heardOf(ana, "chat:message-created").length === 1 &&
                    heardOf(bia, "chat:message-created").length === 1
            )
        ).toBe(true);
        expect(heardOf(ana, "chat:message-created")[0].payload.mentionsMe).toBe(
            true
        );
        expect(heardOf(bia, "chat:message-created")[0].payload.mentionsMe).toBe(
            false
        );
    });

    it("keeps the mentions an edit still has and notifies only the new ones", async () => {
        const ana = await listen("ana");
        const bia = await listen("bia");

        const sent = await send("owner", `oi ${link("ana", users.ana.id)}`);
        const messageId = sent.body.message.id;

        const edited = await edit(
            "owner",
            messageId,
            `oi ${link("ana", users.ana.id)} e ${link("bia", users.bia.id)}`
        );
        expect(edited.status).toBe(200);
        expect(
            edited.body.message.mentions.map((m: Json) => m.userId).sort()
        ).toEqual([users.ana.id, users.bia.id].sort());

        expect(
            await waitFor(
                () =>
                    heardOf(ana, "chat:message-updated").length === 1 &&
                    heardOf(bia, "chat:message-updated").length === 1
            )
        ).toBe(true);
        expect(heardOf(ana, "chat:message-updated")[0].payload.mentionsMe).toBe(
            false
        );
        expect(heardOf(bia, "chat:message-updated")[0].payload.mentionsMe).toBe(
            true
        );

        const removed = await edit("owner", messageId, "sem ninguem");
        expect(removed.body.message.mentions).toEqual([]);
    });

    it("shows a renamed person with the new name in old messages and previews", async () => {
        const { db, usersTable, eq } = database;
        const sent = await send("owner", `fala ${link("bia", users.bia.id)}`);
        expect(sent.status).toBe(201);

        await db
            .update(usersTable)
            .set({ name: "Beatriz" })
            .where(eq(usersTable.id, users.bia.id));

        const list = await call(
            "owner",
            "GET",
            chat(`/${conversationId}/messages`)
        );
        const message = list.body.messages.find(
            (item: Json) => item.id === sent.body.message.id
        );
        expect(message.mentions).toEqual([
            { userId: users.bia.id, name: "Beatriz" },
        ]);

        const conversations = await call("owner", "GET", chat());
        const space = conversations.body.conversations.find(
            (conversation: Json) => conversation.id === conversationId
        );
        expect(space.lastMessage.content).toBe("fala @Beatriz");
    });
});
