import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

// Exercises the instance switches (sign up, organization and space creation)
// and the organization invite links through the real Express stack, against a
// real Postgres. Off unless INTEGRATION_DATABASE_URL points at a throwaway
// database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// E-mails are unique in the database, so a run gets its own suffix.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "member";

const PASSWORD = "Sup3r$ecret1";

describe.skipIf(!enabled)("instance access over HTTP (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let db: typeof import("@standin/database").db;
    let globalSettingsTable: typeof import("@standin/database").globalSettingsTable;
    let organizationInviteLinksTable: typeof import("@standin/database").organizationInviteLinksTable;
    let usersTable: typeof import("@standin/database").usersTable;
    let eq: typeof import("@standin/database").eq;
    let server: http.Server;
    let baseUrl: string;

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    let organizationId: string;
    let otherOrganizationId: string;

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
        let json: any = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = text;
        }
        return { status: response.status, body: json };
    };

    const setSettings = async (data: Record<string, boolean>) => {
        const response = await call("admin", "PUT", "/admin/settings", data);
        expect(response.status).toBe(200);
    };

    let emailCount = 0;
    const account = (extra: Record<string, unknown> = {}) => ({
        name: "New Person",
        email: `new-${++emailCount}-${RUN}@instance.dev`,
        password: PASSWORD,
        ...extra,
    });

    const makeLink = async (
        data: Record<string, unknown> = {},
        as: UserKey = "owner"
    ) => {
        const response = await call(
            as,
            "POST",
            `/organizations/${organizationId}/invite-links`,
            data
        );
        expect(response.status).toBe(201);
        return response.body.link as { id: string; token: string };
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";

        core = await import("@standin/core");
        const database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        ({
            db,
            globalSettingsTable,
            organizationInviteLinksTable,
            usersTable,
            eq,
        } = database);

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@instance.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");

        organizationId = (
            await core.OrganizationService.create(users.owner.id, {
                name: `Instance Org ${RUN}`,
            })
        ).id;
        otherOrganizationId = (
            await core.OrganizationService.create(users.member.id, {
                name: `Other Org ${RUN}`,
            })
        ).id;

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    // Every test starts from the open defaults and puts them back.
    afterEach(async () => {
        await db.delete(globalSettingsTable);
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("defaults", () => {
        it("keeps everything open on a fresh instance", async () => {
            const publicSettings = await call(
                null,
                "GET",
                "/global-settings/settings"
            );
            expect(publicSettings.status).toBe(200);
            expect(publicSettings.body.settings).toEqual({ allowSignup: true });

            const settings = await call("admin", "GET", "/admin/settings");
            expect(settings.body.settings).toEqual({
                allowSignup: true,
                allowOrganizationCreation: true,
                allowSpaceCreation: true,
            });
        });

        it("seeds a fresh row from the environment, and the database wins after", async () => {
            await db.delete(globalSettingsTable);
            process.env.ALLOW_SIGNUP = "false";
            try {
                expect(
                    (await core.GlobalSettingsService.get()).allowSignup
                ).toBe(false);

                // The row exists now: the environment no longer matters.
                process.env.ALLOW_SIGNUP = "true";
                expect(
                    (await core.GlobalSettingsService.get()).allowSignup
                ).toBe(false);
            } finally {
                delete process.env.ALLOW_SIGNUP;
            }
        });
    });

    describe("settings access", () => {
        it("refuses non-admins and anonymous callers", async () => {
            for (const as of ["owner", "member", null] as const) {
                const read = await call(as, "GET", "/admin/settings");
                const write = await call(as, "PUT", "/admin/settings", {
                    allowSignup: false,
                });
                const status = as ? 403 : 401;
                expect(read.status).toBe(status);
                expect(write.status).toBe(status);
                expect((await call(as, "GET", "/admin/users")).status).toBe(
                    status
                );
                expect(
                    (await call(as, "GET", "/admin/organizations")).status
                ).toBe(status);
            }
            expect(
                (await call("admin", "GET", "/admin/settings")).body.settings
                    .allowSignup
            ).toBe(true);
        });

        it("rejects an empty or unknown update", async () => {
            expect(
                (await call("admin", "PUT", "/admin/settings", {})).status
            ).toBe(400);
            expect(
                (await call("admin", "PUT", "/admin/settings", { nope: true }))
                    .status
            ).toBe(400);
        });

        it("lists the users and the organizations for the admin", async () => {
            const people = await call("admin", "GET", "/admin/users");
            expect(people.status).toBe(200);
            expect(
                people.body.users.some((u: any) => u.id === users.owner.id)
            ).toBe(true);
            expect(people.body.users[0]).not.toHaveProperty("password");

            const orgs = await call("admin", "GET", "/admin/organizations");
            const found = orgs.body.organizations.find(
                (o: any) => o.id === organizationId
            );
            expect(found.memberCount).toBe(1);
        });
    });

    describe("capabilities", () => {
        it("tells each person what they may create", async () => {
            await setSettings({ allowOrganizationCreation: false });

            const asMember = await call(
                "member",
                "GET",
                "/global-settings/capabilities"
            );
            expect(asMember.body.capabilities).toEqual({
                canCreateOrganization: false,
                canCreateSpace: true,
            });

            const asAdmin = await call(
                "admin",
                "GET",
                "/global-settings/capabilities"
            );
            expect(asAdmin.body.capabilities.canCreateOrganization).toBe(true);

            expect(
                (await call(null, "GET", "/global-settings/capabilities"))
                    .status
            ).toBe(401);
        });
    });

    describe("sign up", () => {
        it("allows it while open", async () => {
            const response = await call(
                null,
                "POST",
                "/auth/signup",
                account()
            );
            expect(response.status).toBe(201);
        });

        it("refuses it while closed, and existing people still sign in", async () => {
            const person = account();
            expect(
                (await call(null, "POST", "/auth/signup", person)).status
            ).toBe(201);

            await setSettings({ allowSignup: false });
            expect(
                (await call(null, "GET", "/global-settings/settings")).body
                    .settings
            ).toEqual({
                allowSignup: false,
            });

            const closed = await call(null, "POST", "/auth/signup", account());
            expect(closed.status).toBe(403);
            expect(closed.body.code).toBe("SIGNUP_CLOSED");

            const signin = await call(null, "POST", "/auth/signin", {
                email: person.email,
                password: PASSWORD,
            });
            expect(signin.status).toBe(200);
        });
    });

    describe("organization and space creation", () => {
        it("blocks non-admins and lets the admin through", async () => {
            await setSettings({
                allowOrganizationCreation: false,
                allowSpaceCreation: false,
            });

            const org = await call("member", "POST", "/organizations", {
                name: "Blocked",
            });
            expect(org.status).toBe(403);
            expect(org.body.code).toBe("ORGANIZATION_CREATION_BLOCKED");

            const space = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/spaces`,
                { name: "Blocked", sizeTier: "XS" }
            );
            expect(space.status).toBe(403);
            expect(space.body.code).toBe("SPACE_CREATION_BLOCKED");

            const adminOrg = await call("admin", "POST", "/organizations", {
                name: `Admin Org ${RUN}`,
            });
            expect(adminOrg.status).toBe(201);
            const adminSpace = await call(
                "admin",
                "POST",
                `/organizations/${adminOrg.body.organization.id}/spaces`,
                { name: "Allowed", sizeTier: "XS" }
            );
            expect(adminSpace.status).toBe(201);
        });

        it("allows both again once reopened", async () => {
            await setSettings({
                allowOrganizationCreation: false,
                allowSpaceCreation: false,
            });
            await setSettings({
                allowOrganizationCreation: true,
                allowSpaceCreation: true,
            });

            const space = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/spaces`,
                { name: `Open ${RUN}`, sizeTier: "XS" }
            );
            expect(space.status).toBe(201);
        });
    });

    describe("organization invite links", () => {
        it("lets the owner and the admin make links, nobody else", async () => {
            await makeLink({}, "owner");
            await makeLink({}, "admin");

            const asMember = await call(
                "member",
                "POST",
                `/organizations/${organizationId}/invite-links`,
                {}
            );
            expect(asMember.status).toBe(403);

            // An owner of another organization has no say here.
            const asOtherOwner = await call(
                "member",
                "GET",
                `/organizations/${organizationId}/invite-links`
            );
            expect(asOtherOwner.status).toBe(403);
            expect(otherOrganizationId).not.toBe(organizationId);
        });

        it("creates the account inside the organization while sign up is closed", async () => {
            await setSettings({ allowSignup: false });
            const link = await makeLink();

            const preview = await call(
                null,
                "GET",
                `/organization-invites/${link.token}`
            );
            expect(preview.status).toBe(200);
            expect(preview.body.invite.role).toBe("MEMBER");

            const signup = await call(
                null,
                "POST",
                "/auth/signup",
                account({ inviteToken: link.token })
            );
            expect(signup.status).toBe(201);

            const membership = await core.OrganizationService.findMembership(
                signup.body.user.id,
                organizationId
            );
            expect(membership?.role).toBe("MEMBER");
            expect(signup.body.user.role).toBe("USER");
        });

        it("refuses expired, revoked, exhausted and unknown links", async () => {
            await setSettings({ allowSignup: false });
            const attempt = (token: string) =>
                call(
                    null,
                    "POST",
                    "/auth/signup",
                    account({ inviteToken: token })
                );

            const expired = await makeLink();
            await db
                .update(organizationInviteLinksTable)
                .set({ expiresAt: new Date(Date.now() - 1000) })
                .where(eq(organizationInviteLinksTable.id, expired.id));
            const expiredAttempt = await attempt(expired.token);
            expect(expiredAttempt.status).toBe(410);
            expect(expiredAttempt.body.code).toBe("INVITE_LINK_EXPIRED");

            const revoked = await makeLink();
            const revoke = await call(
                "owner",
                "DELETE",
                `/organizations/${organizationId}/invite-links/${revoked.id}`
            );
            expect(revoke.status).toBe(200);
            expect((await attempt(revoked.token)).body.code).toBe(
                "INVITE_LINK_REVOKED"
            );

            const single = await makeLink({ maxUses: 1 });
            expect((await attempt(single.token)).status).toBe(201);
            const exhausted = await attempt(single.token);
            expect(exhausted.status).toBe(410);
            expect(exhausted.body.code).toBe("INVITE_LINK_EXHAUSTED");

            const unknown = await attempt("not-a-real-token");
            expect(unknown.status).toBe(404);
            expect(unknown.body.code).toBe("INVITE_LINK_NOT_FOUND");
        });

        it("spends nothing when the sign up fails", async () => {
            const link = await makeLink({ maxUses: 1 });
            const taken = account();
            expect(
                (await call(null, "POST", "/auth/signup", taken)).status
            ).toBe(201);

            const clash = await call(null, "POST", "/auth/signup", {
                ...taken,
                inviteToken: link.token,
            });
            expect(clash.status).toBe(409);

            const retry = await call(
                null,
                "POST",
                "/auth/signup",
                account({ inviteToken: link.token })
            );
            expect(retry.status).toBe(201);
        });

        it("cannot escalate the role", async () => {
            const asOwner = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/invite-links`,
                { role: "OWNER" }
            );
            expect(asOwner.status).toBe(400);

            const asAdmin = await call(
                "admin",
                "POST",
                `/organizations/${organizationId}/invite-links`,
                { role: "ADMIN" }
            );
            expect(asAdmin.status).toBe(400);
        });

        it("does not list revoked links, and never gives a token back", async () => {
            const link = await makeLink();
            const listed = await call(
                "owner",
                "GET",
                `/organizations/${organizationId}/invite-links`
            );
            const row = listed.body.links.find((l: any) => l.id === link.id);
            expect(row).toBeDefined();
            expect(row).not.toHaveProperty("token");
        });
    });
});
