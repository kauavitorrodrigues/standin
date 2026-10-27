import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// A new chat message over the real Express stack and the real socket server,
// against a real Postgres: the unread count each recipient receives in
// chat:message-created, the batched count query against the per-user one it
// replaces, and how many queries a message costs. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type UserKey = "owner" | "ana" | "bia" | "caio" | "dani";
type Json = any;
type Listener = Socket & { heard: { event: string; payload: Json }[] };

const CREATED = "chat:message-created";

describe.skipIf(!enabled)("chat messages (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let notifyNewMessage: typeof import("@/features/chat/controllers/messages/notifyNewMessage").notifyNewMessage;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: "USER"; name: string }>;
    let organizationId: string;
    let conversationId: string;
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

    const send = (as: UserKey, content: string) =>
        call(as, "POST", chat(`/${conversationId}/messages`), { content });

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

    const created = (socket: Listener) =>
        socket.heard.filter((entry) => entry.event === CREATED);

    const waitFor = async (check: () => boolean, ms = 2000) => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
            if (check()) return true;
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return check();
    };

    const unreadOf = async (as: UserKey) =>
        (await call(as, "GET", chat("/unread-counts"))).body as {
            counts: Record<string, number>;
            total: number;
        };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.env.DB_QUERY_COUNT = "1";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        const { createSocketServer } =
            await import("@/lib/socket/createSocketServer");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);
        ({ notifyNewMessage } =
            await import("@/features/chat/controllers/messages/notifyNewMessage"));

        const { db, usersTable, organizationMembersTable } = database;
        for (const key of ["owner", "ana", "bia", "caio", "dani"] as const) {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@chat.dev`,
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
                email: `admin-${RUN}@chat.dev`,
                password: "x",
                role: "ADMIN",
            })
            .returning({ id: usersTable.id });
        // The library is global and a database used before already has it,
        // with maps on it, which the seed refuses to rewrite. That is fine.
        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: admin.id }
        ).catch(() => undefined);

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Chat Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values(
            (["ana", "bia", "caio", "dani"] as const).map((key) => ({
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
            { name: "Chat", sizeTier: "XS" }
        );
        expect(spaceResponse.status).toBe(201);

        const list = await call("owner", "GET", chat());
        conversationId = list.body.conversations.find(
            (conversation: Json) => conversation.type === "SPACE"
        ).id;
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    it("sends each recipient their own unread count, equal to what the REST count says", async () => {
        const ana = await listen("ana");
        const bia = await listen("bia");
        const owner = await listen("owner");

        expect((await send("owner", "one")).status).toBe(201);
        expect((await send("owner", "two")).status).toBe(201);
        expect((await send("ana", "from ana")).status).toBe(201);

        expect(await waitFor(() => created(bia).length === 3)).toBe(true);
        expect(await waitFor(() => created(ana).length === 2)).toBe(true);

        expect(created(bia).map((e) => e.payload.unreadCount)).toEqual([
            1, 2, 3,
        ]);
        // Ana does not hear her own message and has two unread from the owner.
        expect(created(ana).map((e) => e.payload.unreadCount)).toEqual([1, 2]);
        expect(created(owner).map((e) => e.payload.unreadCount)).toEqual([1]);
        expect(created(bia)[0].payload.message).not.toHaveProperty("seenBy");

        for (const key of ["ana", "bia", "owner"] as const) {
            const counts = await unreadOf(key);
            const last = created(
                key === "ana" ? ana : key === "bia" ? bia : owner
            ).at(-1)!;
            expect(counts.counts[conversationId]).toBe(last.payload.unreadCount);
            expect(counts.total).toBe(last.payload.unreadCount);
        }
        // The sender never hears their own message.
        expect(
            created(owner).every((e) => e.payload.sender.id !== users.owner.id)
        ).toBe(true);
    });

    it("counts again from zero after a read", async () => {
        const bia = await listen("bia");
        expect(
            (await call("bia", "POST", chat(`/${conversationId}/read`))).status
        ).toBeLessThan(300);

        await send("owner", "after read");
        expect(await waitFor(() => created(bia).length === 1)).toBe(true);
        expect(created(bia)[0].payload.unreadCount).toBe(1);
    });

    it("batched counts match the per-user count for reads, own messages and deletions", async () => {
        const { ConversationReadService } = core;
        const everyone = Object.values(users).map((user) => user.id);

        const check = async () => {
            const batch = await ConversationReadService.countUnreadForUsers(
                conversationId,
                everyone
            );
            for (const user of Object.values(users)) {
                const single = await ConversationReadService.getUnreadCounts(
                    user.id,
                    organizationId
                );
                expect(batch[user.id]).toBe(single.counts[conversationId] ?? 0);
            }
            return batch;
        };

        await check();

        // A message deleted by its sender stops counting for everyone else.
        const sent = await send("caio", "to be deleted");
        const before = await check();
        expect(before[users.dani.id]).toBeGreaterThan(0);
        const deleted = await call(
            "caio",
            "DELETE",
            chat(`/${conversationId}/messages/${sent.body.message.id}`)
        );
        expect(deleted.status).toBeLessThan(300);
        const after = await check();
        expect(after[users.dani.id]).toBe(before[users.dani.id] - 1);

        // Reading brings that user to zero and leaves the others alone.
        await call("dani", "POST", chat(`/${conversationId}/read`));
        const read = await check();
        expect(read[users.dani.id]).toBe(0);
        expect(read[users.caio.id]).toBe(after[users.caio.id]);

        // A user with no read row yet counts every message from others.
        expect(await ConversationReadService.countUnreadForUsers(conversationId, [])).toEqual({});
        const unknown = await ConversationReadService.countUnreadForUsers(
            conversationId,
            [users.owner.id]
        );
        expect(Object.keys(unknown)).toEqual([users.owner.id]);
    });

    it("costs the same few queries however many people hear the message", async () => {
        const log = vi.spyOn(console, "log").mockImplementation(() => {});
        const { countQueries } = database;
        const sender = {
            id: users.owner.id,
            name: users.owner.name,
            profilePictureUrl: null,
        };
        const message = (await send("owner", "counted")).body.message;
        const queriesFor = async (label: string) => {
            await countQueries(label, () =>
                notifyNewMessage(conversationId, organizationId, sender, message)
            );
            const line = log.mock.calls
                .map(([text]) => String(text))
                .find((text) => text.includes(`${label}:`));
            return Number(/: (\d+) queries/.exec(line ?? "")?.[1]);
        };

        const fourRecipients = await queriesFor("notify-4-recipients");

        // Two people leave the organization, so two recipients remain.
        await database.db
            .update(database.organizationMembersTable)
            .set({ deletedAt: new Date() })
            .where(
                database.inArray(database.organizationMembersTable.userId, [
                    users.caio.id,
                    users.dani.id,
                ])
            );
        const twoRecipients = await queriesFor("notify-2-recipients");
        log.mockRestore();

        console.info(
            `queries per message: ${fourRecipients} (4 recipients), ${twoRecipients} (2 recipients)`
        );
        expect(fourRecipients).toBe(twoRecipients);
        expect(fourRecipients).toBeLessThanOrEqual(4);
    });
});
