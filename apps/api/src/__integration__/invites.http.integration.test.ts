import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// The fixed links of an organization and of a space, the invitations by
// e-mail, and the guest list of the hosts, through the real Express stack
// against a real Postgres. Off unless INTEGRATION_DATABASE_URL points at a
// throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);
const HOUR_MS = 60 * 60 * 1000;
const PASSWORD = "Sup3r$ecret1";

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
// The fixed people of the file, and the extra ones the later suites add.
type UserKey = string;
type Json = any;

describe.skipIf(!enabled)("invites (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: "USER" }>;
    let organizationId: string;
    let otherOrganizationId: string;
    let spaceId: string;
    let foreignSpaceId: string;

    const call = async (
        as: UserKey | null,
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

    const emailOf = (key: string) => `${key}-${RUN}@invites.dev`;

    const createSpace = async (as: UserKey, orgId: string, name: string) => {
        const created = await call(
            as,
            "POST",
            `/organizations/${orgId}/spaces`,
            { name, sizeTier: "XS" }
        );
        return created;
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
        for (const key of [
            "owner",
            "member",
            "invitee",
            "other",
            "guest",
            "stranger",
        ] as const) {
            const [created] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: emailOf(key),
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            users[key] = { id: created.id, role: "USER" };
        }

        organizationId = (
            await core.OrganizationService.create(users.owner.id, {
                name: `Invites Org ${RUN}`,
            })
        ).id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });
        otherOrganizationId = (
            await core.OrganizationService.create(users.other.id, {
                name: `Foreign Org ${RUN}`,
            })
        ).id;

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        let created = await createSpace("owner", organizationId, "Party");
        if (created.status !== 201) {
            // A blank map needs the default floor, which the library seed brings.
            const [admin] = await db
                .insert(usersTable)
                .values({
                    name: "admin",
                    email: `admin-${RUN}@invites.dev`,
                    password: "x",
                    role: "ADMIN",
                })
                .returning({ id: usersTable.id });
            await core.AssetService.seed(
                { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
                { createdBy: admin.id }
            );
            created = await createSpace("owner", organizationId, "Party");
        }
        expect(created.status).toBe(201);
        spaceId = created.body.space.id;

        const foreign = await createSpace(
            "other",
            otherOrganizationId,
            "Foreign"
        );
        expect(foreign.status).toBe(201);
        foreignSpaceId = foreign.body.space.id;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("fixed link of the organization", () => {
        const route = () => `/organizations/${organizationId}/invite-links`;
        let first: string;

        it("is made on the first ask and is the same after that", async () => {
            const one = await call("owner", "GET", `${route()}/fixed`);
            const two = await call("owner", "GET", `${route()}/fixed`);

            expect(one.status).toBe(200);
            expect(typeof one.body.link.token).toBe("string");
            expect(two.body.link.token).toBe(one.body.link.token);
            first = one.body.link.token;
        });

        it("opens the page of the link", async () => {
            const preview = await call(
                null,
                "GET",
                `/organization-invites/${first}`
            );

            expect(preview.status).toBe(200);
            expect(preview.body.invite).toMatchObject({
                organizationName: `Invites Org ${RUN}`,
                email: null,
            });
        });

        it("is for the owner only", async () => {
            expect(
                (await call("member", "GET", `${route()}/fixed`)).status
            ).toBe(403);
            expect((await call(null, "GET", `${route()}/fixed`)).status).toBe(
                401
            );
            expect(
                (await call("member", "POST", `${route()}/fixed/reset`)).status
            ).toBe(403);
        });

        it("closes the old link when it is reset", async () => {
            const reset = await call("owner", "POST", `${route()}/fixed/reset`);

            expect(reset.status).toBe(200);
            expect(reset.body.link.token).not.toBe(first);
            expect(
                (await call(null, "GET", `/organization-invites/${first}`))
                    .status
            ).toBe(410);
            expect(
                (
                    await call(
                        null,
                        "GET",
                        `/organization-invites/${reset.body.link.token}`
                    )
                ).status
            ).toBe(200);
            expect(
                (await call("owner", "GET", `${route()}/fixed`)).body.link.token
            ).toBe(reset.body.link.token);
        });
    });

    describe("invitations by e-mail", () => {
        const route = () => `/organizations/${organizationId}/invitations`;
        let invitation: { id: string; token: string };

        it("makes one per e-mail and skips who is a member already", async () => {
            const made = await call("owner", "POST", route(), {
                emails: [
                    emailOf("invitee").toUpperCase(),
                    emailOf("member"),
                    emailOf("invitee"),
                ],
            });

            expect(made.status).toBe(201);
            expect(made.body.invitations).toHaveLength(1);
            expect(made.body.invitations[0].email).toBe(emailOf("invitee"));
            expect(made.body.skippedEmails).toEqual([emailOf("member")]);
            invitation = made.body.invitations[0];
            expect(invitation.token.startsWith("inv_")).toBe(true);
        });

        it("renews an invitation that is still open instead of making two", async () => {
            const again = await call("owner", "POST", route(), {
                emails: [emailOf("invitee")],
            });

            expect(again.body.invitations[0].id).toBe(invitation.id);
            expect(
                (await call("owner", "GET", route())).body.invitations
            ).toHaveLength(1);
        });

        it("refuses bad input and who is not the owner", async () => {
            expect(
                (await call("owner", "POST", route(), { emails: ["nope"] }))
                    .status
            ).toBe(400);
            expect(
                (await call("owner", "POST", route(), { emails: [] })).status
            ).toBe(400);
            expect(
                (
                    await call("owner", "POST", route(), {
                        emails: ["a@b.dev"],
                        mapAssetId: "x",
                    })
                ).status
            ).toBe(400);
            expect(
                (await call("member", "POST", route(), { emails: ["a@b.dev"] }))
                    .status
            ).toBe(403);
            expect((await call("member", "GET", route())).status).toBe(403);
        });

        it("refuses a space of another organization", async () => {
            const made = await call("owner", "POST", route(), {
                emails: ["desk@invites.dev"],
                spaceId: foreignSpaceId,
                mapAssetId: "x",
            });

            expect(made.status).toBe(404);
        });

        it("shows the page of the invitation with its e-mail", async () => {
            const preview = await call(
                null,
                "GET",
                `/organization-invites/${invitation.token}`
            );

            expect(preview.status).toBe(200);
            expect(preview.body.invite.email).toBe(emailOf("invitee"));
        });

        it("lists the free desks of a space of the organization only", async () => {
            const own = await call(
                "owner",
                "GET",
                `${route()}/free-desks/${spaceId}`
            );
            const foreign = await call(
                "owner",
                "GET",
                `${route()}/free-desks/${foreignSpaceId}`
            );

            expect(own.status).toBe(200);
            expect(own.body.desks).toEqual([]);
            expect(foreign.status).toBe(404);
        });

        it("is taken only by the account of the e-mail", async () => {
            const wrong = await call(
                "stranger",
                "POST",
                `/organization-invites/${invitation.token}/accept`
            );
            expect(wrong.status).toBe(403);
            expect(wrong.body.code).toBe(
                "ORGANIZATION_INVITATION_EMAIL_MISMATCH"
            );
            expect(
                (
                    await call(
                        null,
                        "POST",
                        `/organization-invites/${invitation.token}/accept`
                    )
                ).status
            ).toBe(401);

            const right = await call(
                "invitee",
                "POST",
                `/organization-invites/${invitation.token}/accept`
            );
            expect(right.status).toBe(200);
            expect(right.body.organizationId).toBe(organizationId);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    users.invitee.id,
                    organizationId
                )
            ).toBe(true);
            expect(
                (await call("owner", "GET", route())).body.invitations
            ).toEqual([]);
            expect(
                (
                    await call(
                        null,
                        "GET",
                        `/organization-invites/${invitation.token}`
                    )
                ).status
            ).toBe(404);
        });

        it("creates the account of a new person from an invitation", async () => {
            const email = `fresh-${RUN}@invites.dev`;
            const made = await call("owner", "POST", route(), {
                emails: [email],
            });
            const token = made.body.invitations[0].token;

            const wrong = await call(null, "POST", "/auth/signup", {
                name: "Fresh",
                email: `other-${RUN}@invites.dev`,
                password: PASSWORD,
                inviteToken: token,
            });
            expect(wrong.status).toBe(403);

            const signed = await call(null, "POST", "/auth/signup", {
                name: "Fresh",
                email,
                password: PASSWORD,
                inviteToken: token,
            });
            expect(signed.status).toBe(201);
            expect(
                await core.OrganizationService.hasActiveMembership(
                    signed.body.user.id,
                    organizationId
                )
            ).toBe(true);
        });

        it("cancels an invitation and its link stops working", async () => {
            const made = await call("owner", "POST", route(), {
                emails: [`cancel-${RUN}@invites.dev`],
            });
            const { id, token } = made.body.invitations[0];

            expect(
                (await call("owner", "DELETE", `${route()}/${id}`)).status
            ).toBe(204);
            expect(
                (await call(null, "GET", `/organization-invites/${token}`))
                    .status
            ).toBe(404);
            expect(
                (await call("owner", "DELETE", `${route()}/${id}`)).status
            ).toBe(404);
        });
    });

    describe("members list of the owner", () => {
        it("gives the e-mails to the owner only", async () => {
            const route = `/organizations/${organizationId}/member-entries`;
            const owner = await call("owner", "GET", route);

            expect(owner.status).toBe(200);
            expect(owner.body.members.map((m: Json) => m.email)).toContain(
                emailOf("member")
            );
            expect(owner.body.members.find((m: Json) => m.isOwner).email).toBe(
                emailOf("owner")
            );
            expect((await call("member", "GET", route)).status).toBe(403);
        });

        it("pages and searches on the server by name or e-mail", async () => {
            const route = `/organizations/${organizationId}/member-entries`;
            const all = await call("owner", "GET", route);
            expect(all.body.total).toBeGreaterThanOrEqual(2);

            const first = await call("owner", "GET", `${route}?take=1&page=1`);
            const second = await call("owner", "GET", `${route}?take=1&page=2`);
            expect(first.body.members).toHaveLength(1);
            expect(second.body.members).toHaveLength(1);
            expect(first.body.total).toBe(all.body.total);
            expect(second.body.members[0].userId).not.toBe(
                first.body.members[0].userId
            );

            const byEmail = await call(
                "owner",
                "GET",
                `${route}?search=${encodeURIComponent(emailOf("member"))}`
            );
            expect(byEmail.body.total).toBe(1);
            expect(byEmail.body.members[0].email).toBe(emailOf("member"));

            const byName = await call("owner", "GET", `${route}?search=OWNE`);
            expect(byName.body.members.map((m: Json) => m.name)).toEqual([
                "owner",
            ]);

            // A wildcard of the text is a plain character, not a pattern.
            const wildcard = await call("owner", "GET", `${route}?search=%25`);
            expect(wildcard.body.total).toBe(0);

            expect(
                (await call("owner", "GET", `${route}?take=101`)).status
            ).toBe(400);
            expect((await call("owner", "GET", `${route}?page=0`)).status).toBe(
                400
            );
        });
    });

    describe("invitations paged by the server", () => {
        it("pages and searches the pending ones by e-mail", async () => {
            const route = `/organizations/${organizationId}/invitations`;
            const made = await call("owner", "POST", route, {
                emails: ["a", "b", "c"].map(
                    (key) => `paged-${key}-${RUN}@invites.dev`
                ),
            });
            expect(made.status).toBe(201);

            const search = `paged-`;
            const first = await call(
                "owner",
                "GET",
                `${route}?search=${search}&take=2&page=1`
            );
            const second = await call(
                "owner",
                "GET",
                `${route}?search=${search}&take=2&page=2`
            );
            expect(first.body.total).toBe(3);
            expect(first.body.invitations).toHaveLength(2);
            expect(second.body.invitations).toHaveLength(1);

            const ids = [...first.body.invitations, ...second.body.invitations]
                .map((invitation: Json) => invitation.id)
                .sort();
            expect(new Set(ids).size).toBe(3);

            const one = await call(
                "owner",
                "GET",
                `${route}?search=paged-b-${RUN}`
            );
            expect(one.body.total).toBe(1);
            expect(one.body.invitations[0].email).toBe(
                `paged-b-${RUN}@invites.dev`
            );

            const wildcard = await call("owner", "GET", `${route}?search=%25`);
            expect(wildcard.body.total).toBe(0);
        });
    });

    describe("fixed link and guests of a space", () => {
        const route = () => `/spaces/${spaceId}`;
        let token: string;
        let guestRowId: string;

        const entries = async (query = "") =>
            (await call("member", "GET", `${route()}/guests/entries${query}`))
                .body.guests as Json[];

        it("is the same link until it is reset, for the owner only", async () => {
            const one = await call(
                "owner",
                "GET",
                `${route()}/invite-links/fixed`
            );
            const two = await call(
                "owner",
                "GET",
                `${route()}/invite-links/fixed`
            );

            expect(one.status).toBe(200);
            expect(two.body.link.token).toBe(one.body.link.token);
            expect(one.body.link.guestValidityHours).toBeNull();
            expect(
                (await call("member", "GET", `${route()}/invite-links/fixed`))
                    .status
            ).toBe(403);

            const reset = await call(
                "owner",
                "POST",
                `${route()}/invite-links/fixed/reset`
            );
            expect(reset.body.link.token).not.toBe(one.body.link.token);
            expect(
                (await call("guest", "GET", `/invites/${one.body.link.token}`))
                    .status
            ).toBe(410);
            token = reset.body.link.token;
        });

        it("sets how long a guest keeps the access", async () => {
            const set = await call(
                "owner",
                "PUT",
                `${route()}/invite-links/fixed/validity`,
                {
                    guestValidityHours: 24,
                }
            );
            expect(set.status).toBe(200);
            expect(set.body.link.guestValidityHours).toBe(24);
            expect(set.body.link.token).toBe(token);

            expect(
                (
                    await call(
                        "owner",
                        "PUT",
                        `${route()}/invite-links/fixed/validity`,
                        {
                            guestValidityHours: 5,
                        }
                    )
                ).status
            ).toBe(400);
            expect(
                (
                    await call(
                        "member",
                        "PUT",
                        `${route()}/invite-links/fixed/validity`,
                        {
                            guestValidityHours: null,
                        }
                    )
                ).status
            ).toBe(403);

            // A reset keeps the validity.
            const reset = await call(
                "owner",
                "POST",
                `${route()}/invite-links/fixed/reset`
            );
            expect(reset.body.link.guestValidityHours).toBe(24);
            token = reset.body.link.token;
        });

        it("lists a request as pending and gives the access the link validity", async () => {
            const asked = await call(
                "guest",
                "POST",
                `/invites/${token}/request`
            );
            expect(asked.status).toBe(200);

            const [pending] = await entries();
            expect(pending).toMatchObject({ state: "PENDING", name: "guest" });
            guestRowId = pending.id;

            const admitted = await call(
                "member",
                "POST",
                `${route()}/guests/${guestRowId}/admit`
            );
            expect(admitted.status).toBe(200);
            const left =
                new Date(admitted.body.guest.expiresAt).getTime() - Date.now();
            expect(left).toBeGreaterThan(23 * HOUR_MS);
            expect(left).toBeLessThanOrEqual(24 * HOUR_MS);
            expect((await entries())[0].state).toBe("ACTIVE");
        });

        it("reads a guest past the validity as expired", async () => {
            const { db, spaceGuestsTable, eq } = database;
            await db
                .update(spaceGuestsTable)
                .set({ expiresAt: new Date(Date.now() - HOUR_MS) })
                .where(eq(spaceGuestsTable.id, guestRowId));

            expect((await entries())[0].state).toBe("EXPIRED");
            // The filter reads a lapsed admission as expired, not active.
            expect(await entries("?state=EXPIRED")).toHaveLength(1);
            expect(await entries("?state=ACTIVE")).toHaveLength(0);

            await db
                .update(spaceGuestsTable)
                .set({ expiresAt: null })
                .where(eq(spaceGuestsTable.id, guestRowId));
            expect((await entries())[0].state).toBe("ACTIVE");
            expect(await entries("?state=ACTIVE")).toHaveLength(1);
            expect(await entries("?state=EXPIRED")).toHaveLength(0);
        });

        it("filters by state exactly as the list labels each row", async () => {
            const { db, spaceGuestsTable, eq } = database;
            const PAST = new Date(Date.now() - HOUR_MS);
            const FUTURE = new Date(Date.now() + HOUR_MS);
            const STATES = [
                "PENDING",
                "ACTIVE",
                "EXPIRED",
                "REVOKED",
                "ARCHIVED",
            ];
            const rows = [
                { status: "PENDING", reason: "AWAITING_RESPONSE" },
                { status: "ADMITTED", reason: "HOST_ADMITTED" },
                { status: "DENIED", reason: "HOST_DENIED" },
                { status: "DENIED", reason: "KICKED" },
                { status: "DENIED", reason: "GUEST_ACCESS_DISABLED" },
                { status: "DENIED", reason: "TIMEOUT" },
            ];
            const ends = [null, FUTURE, PAST];
            const archives = [null, new Date()];

            for (const row of rows) {
                for (const expiresAt of ends) {
                    for (const archivedAt of archives) {
                        await db
                            .update(spaceGuestsTable)
                            .set({
                                status: row.status as "PENDING",
                                statusReason: row.reason as "TIMEOUT",
                                expiresAt,
                                archivedAt,
                            })
                            .where(eq(spaceGuestsTable.id, guestRowId));

                        const [labeled] = await entries();
                        for (const state of STATES) {
                            const found = await entries(`?state=${state}`);
                            const isListed = found.some(
                                (guest: Json) => guest.id === guestRowId
                            );
                            // The filter must select the row only under the
                            // state the list labels it with.
                            expect(
                                isListed,
                                `${row.status}/${row.reason} end=${expiresAt?.toISOString() ?? "none"} archived=${Boolean(archivedAt)} under ${state}`
                            ).toBe(labeled.state === state);
                        }
                    }
                }
            }

            await db
                .update(spaceGuestsTable)
                .set({
                    status: "ADMITTED",
                    statusReason: "HOST_ADMITTED",
                    expiresAt: null,
                    archivedAt: null,
                })
                .where(eq(spaceGuestsTable.id, guestRowId));
        });

        it("pages, searches and filters on the server", async () => {
            const all = await call(
                "member",
                "GET",
                `${route()}/guests/entries`
            );
            expect(all.body.total).toBeGreaterThanOrEqual(1);

            const empty = await call(
                "member",
                "GET",
                `${route()}/guests/entries?take=1&page=99`
            );
            expect(empty.body.guests).toHaveLength(0);
            expect(empty.body.total).toBe(all.body.total);

            expect(await entries("?search=guest")).not.toHaveLength(0);
            expect(await entries("?search=nobody-has-this-name")).toHaveLength(
                0
            );

            const invalid = await call(
                "member",
                "GET",
                `${route()}/guests/entries?state=NOPE`
            );
            expect(invalid.status).toBe(400);
        });

        it("does not archive a guest who is inside", async () => {
            const archived = await call(
                "member",
                "POST",
                `${route()}/guests/${guestRowId}/archive`
            );

            expect(archived.status).toBe(409);
            expect(archived.body.code).toBe("SPACE_GUEST_NOT_ARCHIVABLE");
        });

        it("revokes, archives and reopens", async () => {
            const revoked = await call(
                "member",
                "DELETE",
                `${route()}/guests/${guestRowId}`
            );
            expect(revoked.status).toBe(200);
            expect((await entries())[0].state).toBe("REVOKED");
            expect(await entries("?state=REVOKED")).toHaveLength(1);

            expect(
                (
                    await call(
                        "member",
                        "POST",
                        `${route()}/guests/${guestRowId}/archive`
                    )
                ).status
            ).toBe(204);
            const [archived] = await entries();
            expect(archived.state).toBe("ARCHIVED");
            expect(archived.archivedAt).toEqual(expect.any(String));
            expect(await entries("?state=ARCHIVED")).toHaveLength(1);
            expect(await entries("?state=REVOKED")).toHaveLength(0);

            await call(
                "member",
                "POST",
                `${route()}/guests/${guestRowId}/reset`
            );
            expect((await entries())[0].state).toBe("PENDING");
        });

        it("keeps the list for the hosts", async () => {
            expect(
                (await call("guest", "GET", `${route()}/guests/entries`)).status
            ).toBe(403);
            expect(
                (await call("stranger", "GET", `${route()}/guests/entries`))
                    .status
            ).toBe(403);
            expect(
                (await call("member", "POST", `${route()}/guests/nope/archive`))
                    .status
            ).toBe(404);
        });

        it("admits with no end when the link has no validity", async () => {
            await call(
                "owner",
                "PUT",
                `${route()}/invite-links/fixed/validity`,
                {
                    guestValidityHours: null,
                }
            );
            const admitted = await call(
                "member",
                "POST",
                `${route()}/guests/${guestRowId}/admit`
            );

            expect(admitted.status).toBe(200);
            expect(admitted.body.guest.expiresAt).toBeNull();
        });
    });

    // Extra people and organizations for the suites below. Each owner has its
    // own, because sending invitations is rationed per person (10 a minute).
    const addUser = async (key: string) => {
        const { db, usersTable } = database;
        const [created] = await db
            .insert(usersTable)
            .values({
                name: key,
                email: emailOf(key),
                password: "x",
                role: "USER",
            })
            .returning({ id: usersTable.id });
        users[key] = { id: created.id, role: "USER" };
        return created.id;
    };

    const addOrganization = async (ownerKey: string, name: string) => {
        await addUser(ownerKey);
        const created = await core.OrganizationService.create(
            users[ownerKey].id,
            { name: `${name} ${RUN}` }
        );
        return created.id;
    };

    const addSpace = async (ownerKey: string, orgId: string, name: string) => {
        const created = await createSpace(ownerKey, orgId, name);
        expect(created.status).toBe(201);
        return created.body.space.id as string;
    };

    const invite = async (
        ownerKey: string,
        orgId: string,
        emails: string[],
        desk?: { spaceId: string; mapAssetId: string }
    ) =>
        call(ownerKey, "POST", `/organizations/${orgId}/invitations`, {
            emails,
            ...desk,
        });

    const membershipRows = async (userId: string, orgId: string) => {
        const { db, organizationMembersTable, and, eq, isNull } = database;
        return db
            .select({ id: organizationMembersTable.id })
            .from(organizationMembersTable)
            .where(
                and(
                    eq(organizationMembersTable.userId, userId),
                    eq(organizationMembersTable.organizationId, orgId),
                    isNull(organizationMembersTable.deletedAt)
                )
            );
    };

    describe("taking, expiring and cancelling an invitation", () => {
        let orgId: string;

        beforeAll(async () => {
            orgId = await addOrganization("ownerB", "Taking Org");
        });

        it("refuses the second take of the same link and joins once", async () => {
            await addUser("twice");
            const made = await invite("ownerB", orgId, [emailOf("twice")]);
            const { token } = made.body.invitations[0];
            const route = `/organization-invites/${token}/accept`;

            expect((await call("twice", "POST", route)).status).toBe(200);
            const second = await call("twice", "POST", route);

            expect(second.status).toBe(404);
            expect(second.body.code).toBe("ORGANIZATION_INVITATION_NOT_FOUND");
            expect(await membershipRows(users.twice.id, orgId)).toHaveLength(1);
        });

        it("lets only one of two takes at the same time win", async () => {
            await addUser("racer");
            const made = await invite("ownerB", orgId, [emailOf("racer")]);
            const route = `/organization-invites/${made.body.invitations[0].token}/accept`;

            const results = await Promise.all([
                call("racer", "POST", route),
                call("racer", "POST", route),
            ]);

            expect(results.map((r) => r.status).sort()).toEqual([200, 404]);
            expect(await membershipRows(users.racer.id, orgId)).toHaveLength(1);
        });

        it("answers 410 for the page and the take of an expired invitation", async () => {
            await addUser("late");
            const made = await invite("ownerB", orgId, [emailOf("late")]);
            const { id, token } = made.body.invitations[0];
            const { db, organizationInvitesTable, eq } = database;
            await db
                .update(organizationInvitesTable)
                .set({ expiresAt: new Date(Date.now() - HOUR_MS) })
                .where(eq(organizationInvitesTable.id, id));

            const preview = await call(
                null,
                "GET",
                `/organization-invites/${token}`
            );
            const accept = await call(
                "late",
                "POST",
                `/organization-invites/${token}/accept`
            );

            expect(preview.status).toBe(410);
            expect(preview.body.code).toBe("ORGANIZATION_INVITATION_EXPIRED");
            expect(accept.status).toBe(410);
            expect(accept.body.code).toBe("ORGANIZATION_INVITATION_EXPIRED");
            expect(await membershipRows(users.late.id, orgId)).toHaveLength(0);
        });

        it("does not cancel an invitation through another organization", async () => {
            const made = await invite("ownerB", orgId, [
                `keep-${RUN}@invites.dev`,
            ]);
            const { id } = made.body.invitations[0];

            const wrong = await call(
                "other",
                "DELETE",
                `/organizations/${otherOrganizationId}/invitations/${id}`
            );

            expect(wrong.status).toBe(404);
            const listed = await call(
                "ownerB",
                "GET",
                `/organizations/${orgId}/invitations`
            );
            expect(listed.body.invitations.map((i: Json) => i.id)).toContain(
                id
            );
        });

        it("keeps only the hash and a sealed token at rest", async () => {
            const made = await invite("ownerB", orgId, [
                `rest-${RUN}@invites.dev`,
            ]);
            const { id, token } = made.body.invitations[0];
            const { db, organizationInvitesTable, eq } = database;

            const [row] = await db
                .select()
                .from(organizationInvitesTable)
                .where(eq(organizationInvitesTable.id, id));

            expect(row.tokenHash).toEqual(expect.any(String));
            expect(row.tokenEncrypted).toEqual(expect.any(String));
            expect(row.tokenHash).not.toBe(token);
            for (const value of Object.values(row)) {
                expect(String(value)).not.toContain(token);
            }
        });
    });

    describe("a guest of another space", () => {
        it("is not archived through the URL of a different space", async () => {
            const orgId = await addOrganization("ownerG", "Guests Org");
            const spaceA = await addSpace("ownerG", orgId, "Space A");
            const spaceB = await addSpace("ownerG", orgId, "Space B");
            const { db, spaceGuestsTable, eq } = database;
            const [guestRow] = await db
                .insert(spaceGuestsTable)
                .values({
                    spaceId: spaceA,
                    userId: users.guest.id,
                    status: "DENIED",
                    statusReason: "HOST_DENIED",
                })
                .returning({ id: spaceGuestsTable.id });
            const archivedAt = async () =>
                (
                    await db
                        .select({ at: spaceGuestsTable.archivedAt })
                        .from(spaceGuestsTable)
                        .where(eq(spaceGuestsTable.id, guestRow.id))
                )[0].at;

            const wrong = await call(
                "ownerG",
                "POST",
                `/spaces/${spaceB}/guests/${guestRow.id}/archive`
            );
            expect(wrong.status).toBe(404);
            expect(await archivedAt()).toBeNull();

            const right = await call(
                "ownerG",
                "POST",
                `/spaces/${spaceA}/guests/${guestRow.id}/archive`
            );
            expect(right.status).toBe(204);
            expect(await archivedAt()).not.toBeNull();

            const reopened = await call(
                "ownerG",
                "POST",
                `/spaces/${spaceA}/guests/${guestRow.id}/reset`
            );
            expect(reopened.status).toBe(200);
            expect(await archivedAt()).toBeNull();
        });
    });

    describe("desks kept for an invitation", () => {
        let orgId: string;
        let deskSpaceId: string;
        let otherSpaceId: string;
        const desks: string[] = [];
        let foreignDesk: string;

        const placeDesk = async (
            inSpaceId: string,
            assetId: string,
            x: number
        ) => {
            const { db, spacesTable, mapAssetsTable, eq } = database;
            const [space] = await db
                .select({ mapId: spacesTable.mapId })
                .from(spacesTable)
                .where(eq(spacesTable.id, inSpaceId));
            const [placed] = await db
                .insert(mapAssetsTable)
                .values({
                    mapId: space.mapId,
                    assetId,
                    tileX: x,
                    tileY: 0,
                })
                .returning({ id: mapAssetsTable.id });
            return placed.id;
        };

        const freeDeskIds = async () =>
            (
                await call(
                    "ownerD",
                    "GET",
                    `/organizations/${orgId}/invitations/free-desks/${deskSpaceId}`
                )
            ).body.desks.map((d: Json) => d.mapAssetId) as string[];

        const deskOf = (spaceIdOf: string, userKey: string) => {
            const { db, deskAssignmentsTable, and, eq, isNull } = database;
            return db
                .select({ mapAssetId: deskAssignmentsTable.mapAssetId })
                .from(deskAssignmentsTable)
                .where(
                    and(
                        eq(deskAssignmentsTable.spaceId, spaceIdOf),
                        eq(deskAssignmentsTable.userId, users[userKey].id),
                        isNull(deskAssignmentsTable.deletedAt)
                    )
                );
        };

        const asDesk = (mapAssetId: string) => ({
            spaceId: deskSpaceId,
            mapAssetId,
        });

        beforeAll(async () => {
            orgId = await addOrganization("ownerD", "Desks Org");
            deskSpaceId = await addSpace("ownerD", orgId, "Desks");
            otherSpaceId = await addSpace("ownerD", orgId, "Elsewhere");
            for (const key of ["dA", "dB", "dC", "dE"]) await addUser(key);

            const adminId = await addUser("deskAdmin");
            const asset = await core.AssetService.createAsset(
                {
                    buffer: core.encodePng(
                        32,
                        32,
                        Array.from({ length: 1024 }, () => [5, 5, 5, 255])
                    ),
                },
                {
                    key: `invite-desk-${RUN}`,
                    name: "Invite desk",
                    type: "DESK",
                    category: "ROOM_DECOR",
                    footprint: { w: 1, h: 1 },
                },
                { organizationId: null, createdBy: adminId }
            );
            for (let x = 0; x < 4; x++) {
                desks.push(await placeDesk(deskSpaceId, asset.id, x));
            }
            foreignDesk = await placeDesk(otherSpaceId, asset.id, 0);
        });

        it("lists the desks of the space as free", async () => {
            expect(await freeDeskIds()).toEqual(desks);
        });

        it("keeps a desk for one invitation and hides it from the list", async () => {
            const made = await invite(
                "ownerD",
                orgId,
                [emailOf("dA")],
                asDesk(desks[0])
            );

            expect(made.status).toBe(201);
            expect(made.body.invitations[0].mapAssetId).toBe(desks[0]);
            expect(await freeDeskIds()).toEqual(desks.slice(1));
        });

        it("refuses the same desk for another e-mail but renews its own", async () => {
            const taken = await invite(
                "ownerD",
                orgId,
                [emailOf("dB")],
                asDesk(desks[0])
            );
            expect(taken.status).toBe(409);
            expect(taken.body.code).toBe(
                "ORGANIZATION_INVITATION_DESK_UNAVAILABLE"
            );

            const renewed = await invite(
                "ownerD",
                orgId,
                [emailOf("dA")],
                asDesk(desks[0])
            );
            expect(renewed.status).toBe(201);
            expect(renewed.body.invitations[0].mapAssetId).toBe(desks[0]);
        });

        it("refuses a desk that is not a desk of the space", async () => {
            const missing = await invite(
                "ownerD",
                orgId,
                [emailOf("dB")],
                asDesk("nope")
            );
            const ofAnotherSpace = await invite(
                "ownerD",
                orgId,
                [emailOf("dB")],
                asDesk(foreignDesk)
            );

            expect(missing.status).toBe(409);
            expect(ofAnotherSpace.status).toBe(409);
        });

        it("refuses one desk for several e-mails", async () => {
            const many = await invite(
                "ownerD",
                orgId,
                [emailOf("dB"), emailOf("dC")],
                asDesk(desks[1])
            );

            expect(many.status).toBe(409);
            expect(many.body.code).toBe(
                "ORGANIZATION_INVITATION_DESK_UNAVAILABLE"
            );
        });

        it("gives the person the desk when they take the invitation", async () => {
            const listed = await call(
                "ownerD",
                "GET",
                `/organizations/${orgId}/invitations`
            );
            const { token } = listed.body.invitations.find(
                (i: Json) => i.email === emailOf("dA").toLowerCase()
            );

            const accepted = await call(
                "dA",
                "POST",
                `/organization-invites/${token}/accept`
            );

            expect(accepted.status).toBe(200);
            expect(await deskOf(deskSpaceId, "dA")).toEqual([
                { mapAssetId: desks[0] },
            ]);
            const list = await call(
                "ownerD",
                "GET",
                `/spaces/${deskSpaceId}/desks`
            );
            expect(JSON.stringify(list.body)).toContain(users.dA.id);
        });

        it("joins without the desk when it was deleted meanwhile", async () => {
            const made = await invite(
                "ownerD",
                orgId,
                [emailOf("dE")],
                asDesk(desks[2])
            );
            const { token } = made.body.invitations[0];
            const { db, mapAssetsTable, eq } = database;
            await db
                .update(mapAssetsTable)
                .set({ deletedAt: new Date() })
                .where(eq(mapAssetsTable.id, desks[2]));

            const accepted = await call(
                "dE",
                "POST",
                `/organization-invites/${token}/accept`
            );

            expect(accepted.status).toBe(200);
            expect(await membershipRows(users.dE.id, orgId)).toHaveLength(1);
            expect(await deskOf(deskSpaceId, "dE")).toEqual([]);
        });
    });

    describe("fixed links asked at the same time", () => {
        const liveLinks = async (
            table: "organization" | "space",
            id: string
        ) => {
            const {
                db,
                organizationInviteLinksTable: orgLinks,
                spaceInviteLinksTable: spaceLinks,
                and,
                eq,
                isNull,
                isNotNull,
            } = database;
            const source = table === "organization" ? orgLinks : spaceLinks;
            const owner =
                table === "organization"
                    ? orgLinks.organizationId
                    : spaceLinks.spaceId;
            return db
                .select({ id: source.id })
                .from(source)
                .where(
                    and(
                        eq(owner, id),
                        isNull(source.deletedAt),
                        isNull(source.revokedAt),
                        isNotNull(source.tokenEncrypted)
                    )
                );
        };

        it("makes one organization link out of five first asks", async () => {
            const orgId = await addOrganization("ownerC", "Race Org");
            const route = `/organizations/${orgId}/invite-links/fixed`;

            const asks = await Promise.all(
                Array.from({ length: 5 }, () => call("ownerC", "GET", route))
            );

            expect(asks.map((a) => a.status)).toEqual([
                200, 200, 200, 200, 200,
            ]);
            expect(new Set(asks.map((a) => a.body.link.token)).size).toBe(1);
            expect(await liveLinks("organization", orgId)).toHaveLength(1);

            const resets = await Promise.all([
                call("ownerC", "POST", `${route}/reset`),
                call("ownerC", "POST", `${route}/reset`),
                call("ownerC", "POST", `${route}/reset`),
            ]);
            expect(resets.map((r) => r.status)).toEqual([200, 200, 200]);

            const live = await liveLinks("organization", orgId);
            expect(live).toHaveLength(1);
            const last = await call("ownerC", "GET", route);
            expect(resets.map((r) => r.body.link.token)).toContain(
                last.body.link.token
            );
            expect(last.body.link.id).toBe(live[0].id);
        });

        it("makes one space link out of five first asks and keeps one after resets and validity changes", async () => {
            const orgId = await addOrganization("ownerS", "Race Space Org");
            const spaceRaceId = await addSpace("ownerS", orgId, "Race");
            const route = `/spaces/${spaceRaceId}/invite-links/fixed`;

            const asks = await Promise.all(
                Array.from({ length: 5 }, () => call("ownerS", "GET", route))
            );
            expect(asks.map((a) => a.status)).toEqual([
                200, 200, 200, 200, 200,
            ]);
            expect(new Set(asks.map((a) => a.body.link.token)).size).toBe(1);
            expect(await liveLinks("space", spaceRaceId)).toHaveLength(1);

            const mixed = await Promise.all([
                call("ownerS", "POST", `${route}/reset`),
                call("ownerS", "PUT", `${route}/validity`, {
                    guestValidityHours: 24,
                }),
                call("ownerS", "POST", `${route}/reset`),
                call("ownerS", "PUT", `${route}/validity`, {
                    guestValidityHours: null,
                }),
                call("ownerS", "POST", `${route}/reset`),
            ]);

            expect(mixed.map((m) => m.status)).toEqual([
                200, 200, 200, 200, 200,
            ]);
            const live = await liveLinks("space", spaceRaceId);
            expect(live).toHaveLength(1);
            expect((await call("ownerS", "GET", route)).body.link.id).toBe(
                live[0].id
            );
        });

        it("creates the link with the validity when none exists yet", async () => {
            const orgId = await addOrganization("ownerV", "Validity Org");
            const freshSpaceId = await addSpace("ownerV", orgId, "Fresh");
            const route = `/spaces/${freshSpaceId}/invite-links/fixed`;
            expect(await liveLinks("space", freshSpaceId)).toHaveLength(0);

            const set = await call("ownerV", "PUT", `${route}/validity`, {
                guestValidityHours: 168,
            });

            expect(set.status).toBe(200);
            expect(set.body.link.guestValidityHours).toBe(168);
            const read = await call("ownerV", "GET", route);
            expect(read.body.link.token).toBe(set.body.link.token);
            expect(read.body.link.guestValidityHours).toBe(168);
            expect(await liveLinks("space", freshSpaceId)).toHaveLength(1);
        });
    });

    // Last on purpose: it uses up the window of its own person only.
    describe("rate limit of invitations", () => {
        it("answers 429 on the 11th send within a minute", async () => {
            const orgId = await addOrganization("ownerR", "Rate Org");
            const statuses: number[] = [];

            for (let i = 0; i < 11; i++) {
                const sent = await invite("ownerR", orgId, [
                    `rate-${i}-${RUN}@invites.dev`,
                ]);
                statuses.push(sent.status);
            }

            expect(statuses.slice(0, 10)).toEqual(Array(10).fill(201));
            expect(statuses[10]).toBe(429);
        });
    });
});
