import { createHash } from "node:crypto";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Removing a member and leaving an organization, through the real Express
// stack against a real Postgres. Off unless INTEGRATION_DATABASE_URL points at
// a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type Json = any;

describe.skipIf(!enabled)("organization members (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<string, { id: string; role: "USER" }>;
    let organizationId: string;

    const call = async (
        as: string | null,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        if (body !== undefined) headers["content-type"] = "application/json";
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
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

    const emailOf = (key: string) => `${key}-${RUN}@members.dev`;

    const addMember = async (key: string) => {
        await database.db.insert(database.organizationMembersTable).values({
            userId: users[key].id,
            organizationId,
            role: "MEMBER",
        });
    };

    const connect = async (key: string) => {
        await database.db.insert(database.appConnectionsTable).values({
            organizationId,
            userId: users[key].id,
            provider: "SPOTIFY",
            service: "MUSIC",
            accountId: `account-${key}`,
            accountImageUrl: null,
            refreshTokenSealed: "sealed",
            scope: "scope",
        });
    };

    const connectionsOf = async (key: string) => {
        const { db, appConnectionsTable, and, eq } = database;
        return db
            .select({ id: appConnectionsTable.id })
            .from(appConnectionsTable)
            .where(
                and(
                    eq(appConnectionsTable.organizationId, organizationId),
                    eq(appConnectionsTable.userId, users[key].id)
                )
            );
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.INVITE_LINK_SECRET = "integration-invite-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        for (const key of [
            "owner",
            "leaver",
            "kicked",
            "peer",
            "pending",
            "stranger",
        ] as const) {
            const [created] = await database.db
                .insert(database.usersTable)
                .values({
                    name: key,
                    email: emailOf(key),
                    password: "x",
                    role: "USER",
                })
                .returning({ id: database.usersTable.id });
            users[key] = { id: created.id, role: "USER" };
        }

        organizationId = (
            await core.OrganizationService.create(users.owner.id, {
                name: `Members Org ${RUN}`,
            })
        ).id;
        for (const key of ["leaver", "kicked", "peer", "pending"]) {
            await addMember(key);
        }

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    const route = (userId: string) =>
        `/organizations/${organizationId}/members/${userId}`;

    describe("removing a member", () => {
        it("is for the owner only", async () => {
            const byMember = await call(
                "peer",
                "DELETE",
                route(users.kicked.id)
            );
            expect(byMember.status).toBe(403);
            expect(byMember.body.code).toBe("ORGANIZATION_OWNER_ONLY");
            expect(
                (await call("stranger", "DELETE", route(users.kicked.id)))
                    .status
            ).toBe(403);
            expect(
                (await call(null, "DELETE", route(users.kicked.id))).status
            ).toBe(401);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.kicked.id,
                    organizationId
                )
            ).toBe(true);
        });

        it("never removes the owner", async () => {
            const result = await call("owner", "DELETE", route(users.owner.id));

            expect(result.status).toBe(409);
            expect(result.body.code).toBe(
                "ORGANIZATION_OWNER_CANNOT_BE_REMOVED"
            );
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.owner.id,
                    organizationId
                )
            ).toBe(true);
        });

        it("answers 404 for someone who is not a member", async () => {
            const result = await call(
                "owner",
                "DELETE",
                route(users.stranger.id)
            );

            expect(result.status).toBe(404);
            expect(result.body.code).toBe("ORGANIZATION_MEMBER_NOT_FOUND");
        });

        it("ends the membership and deletes the connections with it", async () => {
            await connect("kicked");
            await connect("peer");
            const result = await call(
                "owner",
                "DELETE",
                route(users.kicked.id)
            );

            expect(result.status).toBe(204);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.kicked.id,
                    organizationId
                )
            ).toBe(false);
            expect(await connectionsOf("kicked")).toHaveLength(0);
            // Someone else's connection is not touched.
            expect(await connectionsOf("peer")).toHaveLength(1);
            expect(
                (
                    await call(
                        "kicked",
                        "GET",
                        `/organizations/${organizationId}/members`
                    )
                ).status
            ).toBe(403);
        });

        it("closes an invitation of the person that was never accepted", async () => {
            // A member is skipped by the invite API, so the row is made here.
            const token = `inv_pending-${RUN}`;
            const { db, organizationInvitesTable } = database;
            await db.insert(organizationInvitesTable).values({
                organizationId,
                email: emailOf("pending"),
                tokenHash: createHash("sha256").update(token).digest("hex"),
                tokenEncrypted: "sealed",
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            });
            expect(
                (await call(null, "GET", `/organization-invites/${token}`))
                    .status
            ).toBe(200);

            const result = await call(
                "owner",
                "DELETE",
                route(users.pending.id)
            );

            expect(result.status).toBe(204);
            expect(
                (await call(null, "GET", `/organization-invites/${token}`))
                    .status
            ).toBe(404);
        });

        it("closes the old invitation, and a new one brings the person back", async () => {
            const invitations = `/organizations/${organizationId}/invitations`;
            const first = await call("owner", "POST", invitations, {
                emails: [emailOf("kicked")],
            });
            expect(first.status).toBe(201);
            const oldToken = first.body.invitations[0].token;
            const accepted = await call(
                "kicked",
                "POST",
                `/organization-invites/${oldToken}/accept`
            );
            expect(accepted.status).toBe(200);

            expect(
                (await call("owner", "DELETE", route(users.kicked.id))).status
            ).toBe(204);

            // The token of the first invitation is dead for good.
            expect(
                (await call(null, "GET", `/organization-invites/${oldToken}`))
                    .status
            ).toBe(404);
            expect(
                (
                    await call(
                        "kicked",
                        "POST",
                        `/organization-invites/${oldToken}/accept`
                    )
                ).status
            ).toBe(404);

            const second = await call("owner", "POST", invitations, {
                emails: [emailOf("kicked")],
            });
            expect(second.status).toBe(201);
            expect(
                (
                    await call(
                        "kicked",
                        "POST",
                        `/organization-invites/${second.body.invitations[0].token}/accept`
                    )
                ).status
            ).toBe(200);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.kicked.id,
                    organizationId
                )
            ).toBe(true);
        });
    });

    describe("leaving", () => {
        it("ends the membership of the member and deletes the connections", async () => {
            await connect("leaver");

            const result = await call(
                "leaver",
                "POST",
                `/organizations/${organizationId}/leave`
            );

            expect(result.status).toBe(204);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.leaver.id,
                    organizationId
                )
            ).toBe(false);
            expect(await connectionsOf("leaver")).toHaveLength(0);
        });

        it("does not let the only owner leave", async () => {
            const result = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/leave`
            );

            expect(result.status).toBe(409);
            expect(result.body.code).toBe("ORGANIZATION_OWNER_CANNOT_LEAVE");
        });

        it("answers 403 to who is not a member", async () => {
            expect(
                (
                    await call(
                        "leaver",
                        "POST",
                        `/organizations/${organizationId}/leave`
                    )
                ).status
            ).toBe(403);
        });
    });
});
