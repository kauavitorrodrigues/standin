import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// A person from outside the organization enters a space as a guest: the link,
// the request, the approval, what the guest can and cannot reach, and the
// sockets, over the real Express stack and the real socket server, against a
// real Postgres. Off unless INTEGRATION_DATABASE_URL points at a throwaway
// database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);
const HOUR = 60 * 60 * 1000;

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type UserKey =
    | "owner"
    | "member"
    | "ana"
    | "bia"
    | "caio"
    | "dani"
    | "otherOwner"
    | "limited"
    | "eli"
    | "fabi"
    | "tmpOwner";
type Json = any;

describe.skipIf(!enabled)("space guests (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: "USER" }>;
    let organizationId: string;
    let space: { id: string; mapId: string };
    let sibling: { id: string; mapId: string };
    let foreign: { id: string; mapId: string };
    let link: { id: string; token: string };
    const sockets: Socket[] = [];

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        const withBody =
            body !== undefined && !["GET", "HEAD"].includes(method);
        if (withBody) headers["content-type"] = "application/json";
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: withBody ? JSON.stringify(body) : undefined,
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

    type Listener = Socket & { heard: { event: string; payload: Json }[] };

    const listen = (as: UserKey): Promise<Listener> =>
        new Promise((resolve, reject) => {
            const socket = connectClient(baseUrl, {
                auth: { token: createToken(users[as]) },
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

    const heard = (socket: Listener, event: string) =>
        socket.heard.filter((entry) => entry.event === event);

    const waitFor = async (check: () => boolean, ms = 2000) => {
        const end = Date.now() + ms;
        while (Date.now() < end) {
            if (check()) return true;
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return check();
    };

    // True when the server let the socket into the space.
    const join = async (socket: Listener, payload: Json) => {
        const before = heard(socket, "space:joined").length;
        socket.emit("space:join", payload);
        return waitFor(
            () => heard(socket, "space:joined").length > before,
            700
        );
    };

    const row = async (spaceId: string, userKey: UserKey) => {
        const { db, spaceGuestsTable, and, eq, isNull } = database;
        const [found] = await db
            .select()
            .from(spaceGuestsTable)
            .where(
                and(
                    eq(spaceGuestsTable.spaceId, spaceId),
                    eq(spaceGuestsTable.userId, users[userKey].id),
                    isNull(spaceGuestsTable.deletedAt)
                )
            );
        return found;
    };

    const setRow = async (
        spaceId: string,
        userKey: UserKey,
        values: Partial<typeof database.spaceGuestsTable.$inferInsert>
    ) => {
        const { db, spaceGuestsTable, and, eq } = database;
        await db
            .update(spaceGuestsTable)
            .set(values)
            .where(
                and(
                    eq(spaceGuestsTable.spaceId, spaceId),
                    eq(spaceGuestsTable.userId, users[userKey].id)
                )
            );
    };

    const request = (as: UserKey, token = link.token) =>
        call(as, "POST", `/invites/${token}/request`);

    const groupedGuests = async (as: UserKey = "owner") =>
        (await call(as, "GET", `/spaces/${space.id}/guests`)).body as {
            pending: Json[];
            admitted: Json[];
            closed: Json[];
        };

    const guestsOf = async (as: UserKey = "owner") => {
        const { pending, admitted, closed } = await groupedGuests(as);
        return [...pending, ...admitted, ...closed];
    };

    const guestId = async (userKey: UserKey) =>
        (await guestsOf()).find((guest) => guest.userId === users[userKey].id)
            ?.id as string;

    const admit = async (userKey: UserKey, as: UserKey = "member") =>
        call(
            as,
            "POST",
            `/spaces/${space.id}/guests/${await guestId(userKey)}/admit`
        );

    const createSpace = async (as: UserKey, orgId: string, name: string) => {
        const created = await call(
            as,
            "POST",
            `/organizations/${orgId}/spaces`,
            { name, sizeTier: "XS" }
        );
        expect(created.status).toBe(201);
        return { id: created.body.space.id, mapId: created.body.mapId };
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
        const { createSocketServer } =
            await import("@/lib/socket/createSocketServer");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;
        const make = async (key: UserKey) => {
            const [created] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@guests.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            users[key] = { id: created.id, role: "USER" };
        };
        for (const key of [
            "owner",
            "member",
            "ana",
            "bia",
            "caio",
            "dani",
            "otherOwner",
            "limited",
            "eli",
            "fabi",
            "tmpOwner",
        ] as const) {
            await make(key);
        }

        // A blank map needs the default floor, which the library seed brings.
        const [admin] = await db
            .insert(usersTable)
            .values({
                name: "admin",
                email: `admin-${RUN}@guests.dev`,
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
            { name: "Guests Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });
        const other = await core.OrganizationService.create(
            users.otherOwner.id,
            { name: "Foreign Org" }
        );

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        space = await createSpace("owner", organizationId, "Party");
        sibling = await createSpace("owner", organizationId, "Sibling");
        foreign = await createSpace("otherOwner", other.id, "Foreign");
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("authentication", () => {
        it("answers 401 without a session on every guest route", async () => {
            for (const [method, route] of [
                ["GET", `/spaces/${space.id}`],
                ["POST", `/spaces/${space.id}/invite-links`],
                ["GET", `/spaces/${space.id}/invite-links`],
                ["DELETE", `/spaces/${space.id}/invite-links/x`],
                ["PUT", `/spaces/${space.id}/guest-access`],
                ["GET", `/spaces/${space.id}/guests`],
                ["GET", `/spaces/${space.id}/guests/me`],
                ["POST", `/spaces/${space.id}/guests/x/admit`],
                ["POST", `/spaces/${space.id}/guests/x/deny`],
                ["POST", `/spaces/${space.id}/guests/x/reset`],
                ["DELETE", `/spaces/${space.id}/guests/x`],
                ["GET", "/invites/abc"],
                ["POST", "/invites/abc/request"],
                ["GET", "/users/me/guest-spaces"],
                ["GET", `/ice-servers?spaceId=${space.id}`],
            ]) {
                expect((await call(null, method, route)).status).toBe(401);
            }
        });
    });

    describe("the invite link", () => {
        it("is made only by the owner of the organization", async () => {
            const route = `/spaces/${space.id}/invite-links`;

            expect((await call("member", "POST", route, {})).status).toBe(403);
            expect((await call("ana", "POST", route, {})).status).toBe(403);
            expect((await call("limited", "GET", route)).status).toBe(403);

            const created = await call("owner", "POST", route, {});
            expect(created.status).toBe(201);
            expect(created.body.link.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
            expect(created.body.link.usesCount).toBe(0);
            expect(created.body.link.maxUses).toBeNull();
            link = created.body.link;
        });

        it("validates the expiration and the use limit", async () => {
            const route = `/spaces/${space.id}/invite-links`;

            expect(
                (await call("owner", "POST", route, { expiresInHours: 0 }))
                    .status
            ).toBe(400);
            expect(
                (await call("owner", "POST", route, { maxUses: 0 })).status
            ).toBe(400);
        });

        it("is listed only to the owner, with the token to copy", async () => {
            const route = `/spaces/${space.id}/invite-links`;

            expect((await call("member", "GET", route)).status).toBe(403);
            const listed = await call("owner", "GET", route);
            expect(listed.status).toBe(200);
            expect(listed.body.links.map((entry: Json) => entry.id)).toContain(
                link.id
            );
        });

        it("tells the guest where the link leads, before asking", async () => {
            const preview = await call("ana", "GET", `/invites/${link.token}`);

            expect(preview.status).toBe(200);
            expect(preview.body.invite).toMatchObject({
                spaceId: space.id,
                spaceName: "Party",
                inviterName: "owner",
                isMember: false,
                guest: null,
            });
        });

        it("says a token that does not exist is not found", async () => {
            const preview = await call("ana", "GET", "/invites/not-a-token");

            expect(preview.status).toBe(404);
            expect(preview.body.code).toBe("INVITE_LINK_NOT_FOUND");
        });

        it("tells a member of the organization they need no invite", async () => {
            const preview = await call(
                "member",
                "GET",
                `/invites/${link.token}`
            );
            const asked = await request("member");

            expect(preview.body.invite.isMember).toBe(true);
            expect(asked.status).toBe(200);
            expect(asked.body).toEqual({
                spaceId: space.id,
                isMember: true,
                guest: null,
            });
            expect(await row(space.id, "member")).toBeUndefined();
        });
    });

    describe("the request", () => {
        it("leaves a pending request and gives no access yet", async () => {
            const asked = await request("ana");

            expect(asked.status).toBe(200);
            expect(asked.body.isMember).toBe(false);
            expect(asked.body.guest).toMatchObject({
                spaceId: space.id,
                status: "PENDING",
                statusReason: "AWAITING_RESPONSE",
            });
        });

        it("keeps a pending guest out of everything", async () => {
            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(404);
            expect(
                (await call("ana", "GET", `/maps/${space.mapId}/render`)).status
            ).toBe(404);
            expect(
                (await call("ana", "GET", `/ice-servers?spaceId=${space.id}`))
                    .status
            ).toBe(404);
            expect(
                (await call("ana", "GET", `/users/me/guest-spaces`)).body.spaces
            ).toEqual([]);

            const socket = await listen("ana");
            expect(await join(socket, { spaceId: space.id })).toBe(false);
        });

        it("lets the guest read their own request", async () => {
            const mine = await call(
                "ana",
                "GET",
                `/spaces/${space.id}/guests/me`
            );

            expect(mine.status).toBe(200);
            expect(mine.body.guest.status).toBe("PENDING");
            expect(
                (await call("bia", "GET", `/spaces/${space.id}/guests/me`)).body
            ).toEqual({ guest: null });
        });

        it("asking again changes nothing and spends no use", async () => {
            const first = (
                await call("ana", "GET", `/spaces/${space.id}/guests/me`)
            ).body.guest;
            const again = await request("ana");

            expect(again.body.guest.id).toBe(first.id);
            const links = (
                await call("owner", "GET", `/spaces/${space.id}/invite-links`)
            ).body.links;
            expect(
                links.find((entry: Json) => entry.id === link.id).usesCount
            ).toBe(1);
        });
    });

    describe("the approval", () => {
        it("shows the hosts who is waiting, and nobody else", async () => {
            const asHost = await guestsOf("member");

            expect(asHost.map((guest) => guest.name)).toContain("ana");
            expect(
                (await call("ana", "GET", `/spaces/${space.id}/guests`)).status
            ).toBe(403);
            expect(
                (await call("limited", "GET", `/spaces/${space.id}/guests`))
                    .status
            ).toBe(403);
        });

        it("does not let a guest admit themself or anyone", async () => {
            const id = await guestId("ana");

            for (const action of ["admit", "deny", "reset"]) {
                expect(
                    (
                        await call(
                            "ana",
                            "POST",
                            `/spaces/${space.id}/guests/${id}/${action}`
                        )
                    ).status
                ).toBe(403);
            }
            expect(
                (
                    await call(
                        "ana",
                        "DELETE",
                        `/spaces/${space.id}/guests/${id}`
                    )
                ).status
            ).toBe(403);
            expect((await row(space.id, "ana")).status).toBe("PENDING");
        });

        it("tells a host who joins the space about the waiting request", async () => {
            const host = await listen("member");
            expect(await join(host, { spaceId: space.id })).toBe(true);

            expect(
                await waitFor(
                    () => heard(host, "space:guest-requested").length === 1
                )
            ).toBe(true);
            expect(
                heard(host, "space:guest-requested")[0].payload.guest
            ).toMatchObject({ name: "ana", status: "PENDING" });
        });

        it("tells the hosts of a new request as it happens, and not an admitted guest", async () => {
            const host = await listen("owner");
            await join(host, { spaceId: space.id });
            const admitted = await listen("bia");
            await request("bia");
            await admit("bia");
            await waitFor(
                () => heard(admitted, "space:guest-status").length > 0
            );
            expect(await join(admitted, { spaceId: space.id })).toBe(true);
            const before = heard(host, "space:guest-requested").length;

            await request("caio");

            expect(
                await waitFor(
                    () => heard(host, "space:guest-requested").length > before
                )
            ).toBe(true);
            await new Promise((resolve) => setTimeout(resolve, 150));
            const seenByGuest = heard(admitted, "space:guest-requested").filter(
                (entry) => entry.payload.guest.name === "caio"
            );
            expect(seenByGuest).toEqual([]);
        });

        it("admits for 24 hours and tells the guest alone", async () => {
            const waiting = await listen("ana");
            const bystander = await listen("limited");

            const admitted = await admit("ana", "member");

            expect(admitted.status).toBe(200);
            expect(admitted.body.guest).toMatchObject({
                status: "ADMITTED",
                statusReason: "HOST_ADMITTED",
                respondedBy: users.member.id,
            });
            const left =
                new Date(admitted.body.guest.expiresAt).getTime() - Date.now();
            expect(left).toBeGreaterThan(23 * HOUR);
            expect(left).toBeLessThanOrEqual(24 * HOUR);
            expect(
                await waitFor(
                    () => heard(waiting, "space:guest-status").length > 0
                )
            ).toBe(true);
            expect(
                heard(waiting, "space:guest-status")[0].payload
            ).toMatchObject({
                status: "ADMITTED",
            });
            expect(heard(bystander, "space:guest-status")).toEqual([]);
        });

        it("refuses to answer a request twice", async () => {
            const id = await guestId("ana");
            const route = `/spaces/${space.id}/guests/${id}`;

            expect(
                (await call("member", "POST", `${route}/admit`)).status
            ).toBe(409);
            expect(
                (await call("member", "POST", `${route}/deny`)).body.code
            ).toBe("SPACE_GUEST_NOT_PENDING");
        });

        it("denies a request, and the denied guest cannot enter", async () => {
            await request("dani");
            const id = await guestId("dani");

            const denied = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/guests/${id}/deny`
            );

            expect(denied.body.guest).toMatchObject({
                status: "DENIED",
                statusReason: "HOST_DENIED",
            });
            expect(
                (await call("dani", "GET", `/spaces/${space.id}`)).status
            ).toBe(404);
            const socket = await listen("dani");
            expect(await join(socket, { spaceId: space.id })).toBe(false);
        });

        it("lets a denied guest ask again with the same link, on the same row", async () => {
            const before = await row(space.id, "dani");

            const again = await request("dani");

            expect(again.body.guest).toMatchObject({
                id: before.id,
                status: "PENDING",
            });
            expect((await row(space.id, "dani")).respondedBy).toBeNull();
            expect(
                (await guestsOf()).filter(
                    (guest) => guest.userId === users.dani.id
                )
            ).toHaveLength(1);
        });

        it("lets a host reopen a denied request without the link", async () => {
            const id = await guestId("dani");
            await call(
                "member",
                "POST",
                `/spaces/${space.id}/guests/${id}/deny`
            );

            const reset = await call(
                "member",
                "POST",
                `/spaces/${space.id}/guests/${id}/reset`
            );

            expect(reset.status).toBe(200);
            expect(reset.body.guest.status).toBe("PENDING");
            expect(
                (
                    await call(
                        "member",
                        "POST",
                        `/spaces/${space.id}/guests/${id}/reset`
                    )
                ).body.code
            ).toBe("SPACE_GUEST_NOT_REOPENABLE");
        });

        it("answers an unknown guest with 404", async () => {
            expect(
                (
                    await call(
                        "owner",
                        "POST",
                        `/spaces/${space.id}/guests/nope/admit`
                    )
                ).status
            ).toBe(404);
        });
    });

    describe("what an admitted guest reaches", () => {
        it("opens the space with nothing of the organization in it", async () => {
            const opened = await call("ana", "GET", `/spaces/${space.id}`);

            expect(opened.status).toBe(200);
            expect(opened.body.space).toMatchObject({
                id: space.id,
                name: "Party",
                conversationId: null,
                viewer: { kind: "GUEST", isOwner: false },
            });
            expect(JSON.stringify(opened.body)).not.toContain(organizationId);
            expect(opened.body.space).not.toHaveProperty("organizationId");
        });

        it("gives a member the same shape with the conversation", async () => {
            const opened = await call("member", "GET", `/spaces/${space.id}`);
            const asOwner = await call("owner", "GET", `/spaces/${space.id}`);

            expect(opened.body.space.viewer).toEqual({
                kind: "MEMBER",
                isOwner: false,
            });
            expect(opened.body.space.conversationId).toEqual(
                expect.any(String)
            );
            expect(asOwner.body.space.viewer.isOwner).toBe(true);
            expect(Object.keys(opened.body.space).sort()).toEqual(
                Object.keys(
                    (await call("ana", "GET", `/spaces/${space.id}`)).body.space
                ).sort()
            );
        });

        it("renders the map and gets the ICE servers", async () => {
            expect(
                (await call("ana", "GET", `/maps/${space.mapId}/render`)).status
            ).toBe(200);
            expect(
                (await call("ana", "GET", `/ice-servers?spaceId=${space.id}`))
                    .status
            ).toBe(200);
        });

        it("lists the space on the home of the guest", async () => {
            const home = await call("ana", "GET", "/users/me/guest-spaces");

            expect(home.body.spaces).toEqual([
                {
                    id: space.id,
                    name: "Party",
                    expiresAt: expect.any(String),
                },
            ]);
        });

        it("is refused everything about the organization", async () => {
            for (const [method, route] of [
                ["GET", `/organizations/${organizationId}/members`],
                ["GET", `/organizations/${organizationId}/spaces`],
                ["GET", `/organizations/${organizationId}/spaces/${space.id}`],
                ["GET", `/organizations/${organizationId}/library/assets`],
                ["GET", `/organizations/${organizationId}/conversations`],
            ]) {
                expect((await call("ana", method, route)).status).toBe(403);
            }
        });

        it("cannot edit, decorate, publish or take a desk", async () => {
            for (const [method, route, body] of [
                ["GET", `/maps/${space.mapId}/export`, undefined],
                ["GET", `/maps/${space.mapId}/library`, undefined],
                ["GET", `/maps/${space.mapId}/lock`, undefined],
                ["POST", `/maps/${space.mapId}/publish`, {}],
                ["POST", `/maps/${space.mapId}/assets`, {}],
                ["PATCH", `/maps/${space.mapId}/assets/x`, {}],
                ["DELETE", `/maps/${space.mapId}/assets/x`, undefined],
                ["GET", `/spaces/${space.id}/desks`, undefined],
                ["POST", `/spaces/${space.id}/desks/x/claim`, undefined],
                ["DELETE", `/spaces/${space.id}/desks/x/claim`, undefined],
                ["POST", `/spaces/${space.id}/desks/x/assign`, {}],
            ] as [string, string, unknown][]) {
                const status = (await call("ana", method, route, body)).status;
                expect([403, 404], `${method} ${route}`).toContain(status);
            }
        });

        it("cannot make links, run guests or change the guest access", async () => {
            for (const [method, route] of [
                ["POST", `/spaces/${space.id}/invite-links`],
                ["GET", `/spaces/${space.id}/invite-links`],
                ["PUT", `/spaces/${space.id}/guest-access`],
                ["GET", `/spaces/${space.id}/guests`],
            ]) {
                expect((await call("ana", method, route, {})).status).toBe(403);
            }
        });

        it("cannot create or delete a space", async () => {
            expect(
                (
                    await call(
                        "ana",
                        "POST",
                        `/organizations/${organizationId}/spaces`,
                        { name: "Mine", sizeTier: "XS" }
                    )
                ).status
            ).toBe(403);
            expect(
                (
                    await call(
                        "ana",
                        "DELETE",
                        `/organizations/${organizationId}/spaces/${space.id}`
                    )
                ).status
            ).toBe(403);
        });

        it("sees nothing of the other spaces, in or out of the organization", async () => {
            for (const target of [sibling, foreign]) {
                expect(
                    (await call("ana", "GET", `/spaces/${target.id}`)).status
                ).toBe(404);
                expect(
                    (await call("ana", "GET", `/maps/${target.mapId}/render`))
                        .status
                ).toBe(404);
                expect(
                    (
                        await call(
                            "ana",
                            "GET",
                            `/ice-servers?spaceId=${target.id}`
                        )
                    ).status
                ).toBe(404);
            }
        });
    });

    describe("the socket", () => {
        it("lets the admitted guest into that space only", async () => {
            const socket = await listen("ana");

            expect(await join(socket, { spaceId: space.id })).toBe(true);
            expect(await join(socket, { spaceId: sibling.id })).toBe(false);
            expect(await join(socket, { spaceId: foreign.id })).toBe(false);
            expect(await join(socket, { spaceId: "no-such-space" })).toBe(
                false
            );
        });

        it("ignores an organization and a user the client forges", async () => {
            const socket = await listen("ana");

            const strangerOrganization = await join(socket, {
                spaceId: sibling.id,
                organizationId,
                userId: users.owner.id,
            });
            const asThemselves = await join(socket, {
                spaceId: space.id,
                organizationId: "forged",
                userId: users.owner.id,
            });

            // The forged organization opens no other space, and the forged user
            // changes nothing: the one in the space is the guest of the token.
            expect(strangerOrganization).toBe(false);
            expect(asThemselves).toBe(true);
            const present = await listen("owner");
            await join(present, { spaceId: space.id });
            const peers = heard(present, "space:joined")[0].payload.peers;
            expect(
                peers.filter((peer: Json) => peer.userId === users.owner.id)
            ).toEqual([]);
            expect(peers.map((peer: Json) => peer.userId)).toContain(
                users.ana.id
            );
        });

        it("keeps the guest out of the host room", async () => {
            const guest = await listen("ana");
            await join(guest, { spaceId: space.id });
            const before = heard(guest, "space:guest-requested").length;

            const joiner = await listen("limited");
            expect(joiner.connected).toBe(true);
            await request("limited");

            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(heard(guest, "space:guest-requested").length).toBe(before);
        });
    });

    describe("the end of the access", () => {
        it("sends out a connected guest when a host removes them", async () => {
            const socket = await listen("ana");
            await join(socket, { spaceId: space.id });
            const watcher = await listen("owner");
            await join(watcher, { spaceId: space.id });

            const removed = await call(
                "member",
                "DELETE",
                `/spaces/${space.id}/guests/${await guestId("ana")}`
            );

            expect(removed.body.guest).toMatchObject({
                status: "DENIED",
                statusReason: "KICKED",
            });
            expect(
                await waitFor(
                    () => heard(socket, "space:guest-removed").length > 0
                )
            ).toBe(true);
            expect(await waitFor(() => !socket.connected)).toBe(true);
            expect(
                await waitFor(() =>
                    heard(watcher, "space:peer-left").some(
                        (entry) => entry.payload.userId === users.ana.id
                    )
                )
            ).toBe(true);
            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(404);
            expect(
                (await call("ana", "GET", `/maps/${space.mapId}/render`)).status
            ).toBe(404);
        });

        it("only removes who is inside", async () => {
            const pending = await guestId("caio");

            const attempt = await call(
                "member",
                "DELETE",
                `/spaces/${space.id}/guests/${pending}`
            );

            expect(attempt.status).toBe(409);
            expect(attempt.body.code).toBe("SPACE_GUEST_NOT_ADMITTED");
        });

        it("lets a removed guest ask again", async () => {
            const asked = await request("ana");

            expect(asked.body.guest.status).toBe("PENDING");
            expect((await row(space.id, "ana")).statusReason).toBe(
                "AWAITING_RESPONSE"
            );
            await admit("ana");
            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(200);
        });

        it("closes the access 24 hours after the admission, even before the sweeper runs", async () => {
            await setRow(space.id, "ana", {
                expiresAt: new Date(Date.now() - 1000),
            });

            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(404);
            expect(
                (await call("ana", "GET", `/spaces/${space.id}/guests/me`)).body
                    .guest
            ).toMatchObject({ status: "DENIED", statusReason: "TIMEOUT" });
            const socket = await listen("ana");
            expect(await join(socket, { spaceId: space.id })).toBe(false);
            expect(
                (await call("ana", "GET", `/users/me/guest-spaces`)).body.spaces
            ).toEqual([]);
        });

        it("writes the lapsed ones down and cuts the sockets of the admitted", async () => {
            await call("ana", "POST", `/invites/${link.token}/request`);
            await admit("ana");
            const socket = await listen("ana");
            await join(socket, { spaceId: space.id });
            await setRow(space.id, "ana", {
                expiresAt: new Date(Date.now() - 1000),
            });
            await setRow(space.id, "caio", {
                expiresAt: new Date(Date.now() - 1000),
            });

            const expired = await core.SpaceGuestService.expireDue();

            expect(
                expired.map(({ userId, wasAdmitted }) => [userId, wasAdmitted])
            ).toEqual(
                expect.arrayContaining([
                    [users.ana.id, true],
                    [users.caio.id, false],
                ])
            );
            expect(await row(space.id, "ana")).toMatchObject({
                status: "DENIED",
                statusReason: "TIMEOUT",
            });
            expect(
                await waitFor(
                    () => heard(socket, "space:guest-removed").length > 0
                )
            ).toBe(true);
            expect(await core.SpaceGuestService.expireDue()).toEqual([]);
        });

        it("refuses to admit a request that waited more than 24 hours", async () => {
            await request("caio");
            await setRow(space.id, "caio", {
                expiresAt: new Date(Date.now() - 1000),
            });
            const id = await guestId("caio");

            const late = await call(
                "member",
                "POST",
                `/spaces/${space.id}/guests/${id}/admit`
            );

            expect(late.status).toBe(409);
            expect(late.body.code).toBe("SPACE_GUEST_REQUEST_EXPIRED");
        });
    });

    describe("the guest access of the space", () => {
        it("is changed only by the owner", async () => {
            const route = `/spaces/${space.id}/guest-access`;

            expect(
                (
                    await call("member", "PUT", route, {
                        guestAccess: "DISABLED",
                    })
                ).status
            ).toBe(403);
            expect(
                (await call("owner", "PUT", route, { guestAccess: "NEVER" }))
                    .status
            ).toBe(400);
        });

        it("denies the waiting, sends out the admitted and refuses new requests", async () => {
            await request("ana");
            await admit("ana");
            const inside = await listen("ana");
            await join(inside, { spaceId: space.id });
            await request("dani");
            await core.SpaceGuestService.reset(
                space.id,
                await guestId("dani")
            ).catch(() => undefined);

            const turned = await call(
                "owner",
                "PUT",
                `/spaces/${space.id}/guest-access`,
                { guestAccess: "DISABLED" }
            );

            expect(turned.status).toBe(200);
            expect(turned.body.space.guestAccess).toBe("DISABLED");
            expect(await row(space.id, "ana")).toMatchObject({
                status: "DENIED",
                statusReason: "GUEST_ACCESS_DISABLED",
            });
            expect(
                await waitFor(
                    () => heard(inside, "space:guest-removed").length > 0
                )
            ).toBe(true);
            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(404);

            const refused = await request("bia");
            expect(refused.status).toBe(403);
            expect(refused.body.code).toBe("GUEST_ACCESS_DISABLED");
            expect(
                (await call("bia", "GET", `/invites/${link.token}`)).body.code
            ).toBe("GUEST_ACCESS_DISABLED");
        });

        it("does not let a host reopen a request while it is off", async () => {
            const reset = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/guests/${await guestId("ana")}/reset`
            );

            expect(reset.status).toBe(403);
            expect(reset.body.code).toBe("GUEST_ACCESS_DISABLED");
        });

        it("takes guests again once it is back on", async () => {
            const turned = await call(
                "owner",
                "PUT",
                `/spaces/${space.id}/guest-access`,
                { guestAccess: "ALLOWED" }
            );
            expect(turned.body.space.guestAccess).toBe("ALLOWED");

            const asked = await request("ana");

            expect(asked.body.guest.status).toBe("PENDING");
        });
    });

    describe("the limits of a link", () => {
        it("refuses a revoked link with its own error, and keeps who is already in", async () => {
            await admit("ana");
            const revoked = await call(
                "owner",
                "DELETE",
                `/spaces/${space.id}/invite-links/${link.id}`
            );
            expect(revoked.body.link.revokedAt).toEqual(expect.any(String));

            const refused = await request("dani");
            expect(refused.status).toBe(410);
            expect(refused.body.code).toBe("INVITE_LINK_REVOKED");
            expect(
                (await call("dani", "GET", `/invites/${link.token}`)).body.code
            ).toBe("INVITE_LINK_REVOKED");
            // Already admitted: the access belongs to the guest, not to the link.
            expect(
                (await call("ana", "GET", `/spaces/${space.id}`)).status
            ).toBe(200);
            const left = (
                await call("owner", "GET", `/spaces/${space.id}/invite-links`)
            ).body.links;
            expect(left.map((entry: Json) => entry.id)).not.toContain(link.id);
            expect(
                (
                    await call(
                        "owner",
                        "DELETE",
                        `/spaces/${space.id}/invite-links/${link.id}`
                    )
                ).status
            ).toBe(404);
        });

        it("refuses an expired link", async () => {
            const made = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/invite-links`,
                { expiresInHours: 1 }
            );
            const { db, spaceInviteLinksTable, eq } = database;
            await db
                .update(spaceInviteLinksTable)
                .set({ expiresAt: new Date(Date.now() - 1000) })
                .where(eq(spaceInviteLinksTable.id, made.body.link.id));

            const refused = await request("dani", made.body.link.token);

            expect(refused.status).toBe(410);
            expect(refused.body.code).toBe("INVITE_LINK_EXPIRED");
        });

        it("spends one use per request and refuses past the limit", async () => {
            const made = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/invite-links`,
                { maxUses: 1 }
            );
            const token = made.body.link.token;

            const first = await request("dani", token);
            const second = await request("bia", token);

            expect(first.body.guest.status).toBe("PENDING");
            expect(second.status).toBe(410);
            expect(second.body.code).toBe("INVITE_LINK_EXHAUSTED");
            // The one who already holds a live pass can ask again at no cost.
            expect((await request("dani", token)).status).toBe(200);
        });

        it("lets only one of two simultaneous requests take the last use", async () => {
            const made = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/invite-links`,
                { maxUses: 1 }
            );
            const token = made.body.link.token;

            const answers = await Promise.all([
                request("bia", token),
                request("caio", token),
            ]);

            expect(answers.map((answer) => answer.status).sort()).toEqual([
                200, 410,
            ]);
        });
    });

    describe("a member who is also a guest elsewhere", () => {
        it("keeps both accesses apart", async () => {
            const made = await call(
                "otherOwner",
                "POST",
                `/spaces/${foreign.id}/invite-links`,
                {}
            );
            await request("owner", made.body.link.token);
            const { id } = (
                await call("otherOwner", "GET", `/spaces/${foreign.id}/guests`)
            ).body.pending[0];
            await call(
                "otherOwner",
                "POST",
                `/spaces/${foreign.id}/guests/${id}/admit`
            );

            const asGuest = await call("owner", "GET", `/spaces/${foreign.id}`);
            const asOwner = await call("owner", "GET", `/spaces/${space.id}`);

            expect(asGuest.body.space.viewer).toEqual({
                kind: "GUEST",
                isOwner: false,
            });
            expect(asOwner.body.space.viewer).toEqual({
                kind: "MEMBER",
                isOwner: true,
            });
            expect(
                (
                    await call(
                        "owner",
                        "PUT",
                        `/spaces/${foreign.id}/guest-access`,
                        { guestAccess: "DISABLED" }
                    )
                ).status
            ).toBe(403);
            expect(
                (await call("owner", "GET", `/maps/${foreign.mapId}/export`))
                    .status
            ).toBe(403);
            expect(
                (await call("owner", "GET", `/maps/${space.mapId}/export`))
                    .status
            ).toBe(200);
        });
    });

    describe("the rate limit", () => {
        it("slows down who keeps opening and requesting invites", async () => {
            const statuses: number[] = [];
            for (let i = 0; i < 12; i++) {
                statuses.push(
                    (await call("limited", "POST", "/invites/nothing/request"))
                        .status
                );
            }
            const previews: number[] = [];
            for (let i = 0; i < 32; i++) {
                previews.push(
                    (await call("limited", "GET", "/invites/nothing")).status
                );
            }

            expect(statuses.slice(0, 9)).not.toContain(429);
            expect(statuses.at(-1)).toBe(429);
            expect(previews.at(-1)).toBe(429);
            // Another person is not affected.
            expect((await call("dani", "GET", "/invites/nothing")).status).toBe(
                404
            );
        });
    });

    describe("deleting the space", () => {
        it("closes the links, removes the guests and cuts their sockets", async () => {
            const doomed = await createSpace("owner", organizationId, "Doomed");
            const made = await call(
                "owner",
                "POST",
                `/spaces/${doomed.id}/invite-links`,
                {}
            );
            await request("bia", made.body.link.token);
            const id = (
                await call("owner", "GET", `/spaces/${doomed.id}/guests`)
            ).body.pending[0].id;
            await call(
                "owner",
                "POST",
                `/spaces/${doomed.id}/guests/${id}/admit`
            );
            const socket = await listen("bia");
            await join(socket, { spaceId: doomed.id });

            const deleted = await call(
                "owner",
                "DELETE",
                `/organizations/${organizationId}/spaces/${doomed.id}`
            );

            expect(deleted.status).toBe(200);
            expect(
                await waitFor(
                    () => heard(socket, "space:guest-removed").length > 0
                )
            ).toBe(true);
            expect(
                (await call("bia", "GET", `/spaces/${doomed.id}`)).status
            ).toBe(404);
            expect(
                (
                    await call("bia", "GET", "/users/me/guest-spaces")
                ).body.spaces.map((entry: Json) => entry.id)
            ).not.toContain(doomed.id);
            expect(
                (await call("bia", "GET", `/invites/${made.body.link.token}`))
                    .status
            ).toBe(404);
            expect(await row(doomed.id, "bia")).toBeUndefined();
        });
    });

    describe("what the review of the code asked for", () => {
        const freshLink = async (spaceId = space.id) =>
            (await call("owner", "POST", `/spaces/${spaceId}/invite-links`, {}))
                .body.link as Json;

        it("keeps only the hash of the token and never lists the token again", async () => {
            const { createHash } = await import("node:crypto");
            const made = await freshLink();
            const { db, spaceInviteLinksTable, eq } = database;
            const [stored] = await db
                .select()
                .from(spaceInviteLinksTable)
                .where(eq(spaceInviteLinksTable.id, made.id));

            expect(stored.tokenHash).toBe(
                createHash("sha256").update(made.token).digest("hex")
            );
            expect(JSON.stringify(stored)).not.toContain(made.token);

            const listed = await call(
                "owner",
                "GET",
                `/spaces/${space.id}/invite-links`
            );
            expect(JSON.stringify(listed.body)).not.toContain(made.token);
            expect(listed.body.links[0]).not.toHaveProperty("token");
            // The hash is not a way in: only the token opens the invite.
            expect(
                (await call("eli", "GET", `/invites/${stored.tokenHash}`))
                    .status
            ).toBe(404);
            expect(
                (await call("eli", "GET", `/invites/${made.token}`)).status
            ).toBe(200);
        });

        it("makes one request and spends one use when the same person asks at once", async () => {
            const made = await freshLink();

            const answers = await Promise.all([
                request("eli", made.token),
                request("eli", made.token),
                request("eli", made.token),
            ]);

            expect(answers.map((answer) => answer.status)).toEqual([
                200, 200, 200,
            ]);
            const ids = new Set(answers.map((answer) => answer.body.guest.id));
            expect(ids.size).toBe(1);
            const links = (
                await call("owner", "GET", `/spaces/${space.id}/invite-links`)
            ).body.links;
            expect(
                links.find((entry: Json) => entry.id === made.id).usesCount
            ).toBe(1);
            expect(
                (await guestsOf()).filter(
                    (guest) => guest.userId === users.eli.id
                )
            ).toHaveLength(1);
        });

        it("makes one request and spends one use when a denied person asks again at once", async () => {
            await call(
                "owner",
                "POST",
                `/spaces/${space.id}/guests/${await guestId("eli")}/deny`
            );
            const made = await freshLink();

            const answers = await Promise.all([
                request("eli", made.token),
                request("eli", made.token),
            ]);

            expect(answers.map((answer) => answer.status)).toEqual([200, 200]);
            const links = (
                await call("owner", "GET", `/spaces/${space.id}/invite-links`)
            ).body.links;
            expect(
                links.find((entry: Json) => entry.id === made.id).usesCount
            ).toBe(1);
            expect((await row(space.id, "eli")).status).toBe("PENDING");
        });

        it("lists the first to ask first, and a request asked again goes to the end", async () => {
            const made = await freshLink();
            await request("fabi", made.token);
            await call(
                "owner",
                "POST",
                `/spaces/${space.id}/guests/${await guestId("eli")}/deny`
            );
            await request("eli", made.token);

            const { pending } = await groupedGuests();
            const names = pending.map((guest) => guest.name);

            expect(names.indexOf("fabi")).toBeLessThan(names.indexOf("eli"));
        });

        it("groups the list for the hosts and caps nothing alive", async () => {
            const grouped = await groupedGuests("member");

            expect(Object.keys(grouped).sort()).toEqual([
                "admitted",
                "closed",
                "pending",
            ]);
            for (const guest of grouped.pending) {
                expect(guest.status).toBe("PENDING");
            }
            for (const guest of grouped.admitted) {
                expect(guest.status).toBe("ADMITTED");
            }
            for (const guest of grouped.closed) {
                expect(guest.status).toBe("DENIED");
            }
        });

        it("refuses to admit a request that outlived the switch of the guest access", async () => {
            const { db, spacesTable, eq } = database;
            const id = await guestId("fabi");
            // What a request that raced the switch would have left behind.
            await db
                .update(spacesTable)
                .set({ guestAccess: "DISABLED" })
                .where(eq(spacesTable.id, space.id));

            const refused = await call(
                "member",
                "POST",
                `/spaces/${space.id}/guests/${id}/admit`
            );
            await db
                .update(spacesTable)
                .set({ guestAccess: "ALLOWED" })
                .where(eq(spacesTable.id, space.id));

            expect(refused.status).toBe(403);
            expect(refused.body.code).toBe("GUEST_ACCESS_DISABLED");
            expect((await row(space.id, "fabi")).status).toBe("PENDING");
        });

        it("tells the hosts when a request was answered, and not the guests", async () => {
            const host = await listen("member");
            await join(host, { spaceId: space.id });
            const inside = await listen("ana");
            await request("ana", (await freshLink()).token);
            await admit("ana");
            await join(inside, { spaceId: space.id });
            const before = heard(host, "space:guest-updated").length;
            const insideBefore = heard(inside, "space:guest-updated").length;

            await admit("fabi");

            expect(
                await waitFor(
                    () => heard(host, "space:guest-updated").length > before
                )
            ).toBe(true);
            expect(heard(host, "space:guest-updated").at(-1)?.payload).toEqual({
                spaceId: space.id,
            });
            await new Promise((resolve) => setTimeout(resolve, 150));
            expect(heard(inside, "space:guest-updated").length).toBe(
                insideBefore
            );
        });

        it("turns a kicked guest whose time had already run out into a kicked one", async () => {
            await setRow(space.id, "fabi", {
                expiresAt: new Date(Date.now() - 1000),
            });

            const removed = await call(
                "owner",
                "DELETE",
                `/spaces/${space.id}/guests/${await guestId("fabi")}`
            );

            expect(removed.status).toBe(200);
            expect(removed.body.guest).toMatchObject({
                status: "DENIED",
                statusReason: "KICKED",
            });
        });

        it("hands a guest relay credentials that last less than a member's", async () => {
            process.env.TURN_HOST = "turn.example.com";
            process.env.TURN_SECRET = "secret";
            try {
                await request("ana", (await freshLink()).token);
                await admit("ana");
                const expiryOf = async (as: UserKey) => {
                    const ice = await call(
                        as,
                        "GET",
                        `/ice-servers?spaceId=${space.id}`
                    );
                    const turn = ice.body.iceServers.find(
                        (server: Json) => server.username
                    );
                    return (
                        Number(turn.username.split(":")[0]) - Date.now() / 1000
                    );
                };

                const guestLeft = await expiryOf("ana");
                const memberLeft = await expiryOf("member");

                expect(guestLeft).toBeGreaterThan(19 * 60);
                expect(guestLeft).toBeLessThanOrEqual(20 * 60);
                expect(memberLeft).toBeGreaterThan(55 * 60);
            } finally {
                delete process.env.TURN_HOST;
                delete process.env.TURN_SECRET;
            }
        });

        it("cuts the sockets of the guests when the whole organization is deleted", async () => {
            const org = await core.OrganizationService.create(
                users.tmpOwner.id,
                {
                    name: "Short Lived",
                }
            );
            const doomed = await createSpace("tmpOwner", org.id, "Gone");
            const made = await call(
                "tmpOwner",
                "POST",
                `/spaces/${doomed.id}/invite-links`,
                {}
            );
            await request("fabi", made.body.link.token);
            const id = (
                await call("tmpOwner", "GET", `/spaces/${doomed.id}/guests`)
            ).body.pending[0].id;
            await call(
                "tmpOwner",
                "POST",
                `/spaces/${doomed.id}/guests/${id}/admit`
            );
            const socket = await listen("fabi");
            await join(socket, { spaceId: doomed.id });

            const deleted = await call(
                "tmpOwner",
                "DELETE",
                `/organizations/${org.id}`
            );

            expect(deleted.status).toBe(200);
            expect(
                await waitFor(
                    () => heard(socket, "space:guest-removed").length > 0
                )
            ).toBe(true);
            expect(await waitFor(() => !socket.connected)).toBe(true);
            expect(
                (await call("fabi", "GET", `/spaces/${doomed.id}`)).status
            ).toBe(404);
        });
    });
});
