import { beforeAll, describe, expect, it } from "vitest";

// The exact-member-set lookup and the advisory lock against a real Postgres.
// Off unless INTEGRATION_DATABASE_URL points at a throwaway database
// different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("../../../index");
type UserKey = "owner" | "ana" | "bia" | "caio";

describe.skipIf(!enabled)("findOrCreateDirect (real database)", () => {
    let core: Core;
    let organizationId: string;
    const ids = {} as Record<UserKey, string>;

    const open = (creator: UserKey, recipients: UserKey[]) =>
        core.ConversationService.findOrCreateDirect(
            organizationId,
            ids[creator],
            recipients.map((key) => ids[key])
        );

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        core = await import("../../../index");
        const database = await import("@standin/database");
        const { db, usersTable, organizationMembersTable } = database;

        for (const key of ["owner", "ana", "bia", "caio"] as const) {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@direct.dev`,
                    password: "x",
                    role: "USER",
                })
                .returning({ id: usersTable.id });
            ids[key] = row.id;
        }

        const organization = await core.OrganizationService.create(ids.owner, {
            name: "Direct Org",
        });
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values(
            (["ana", "bia", "caio"] as const).map((key) => ({
                userId: ids[key],
                organizationId,
                role: "MEMBER" as const,
            }))
        );
    });

    it("returns the same conversation for the same member set in any order", async () => {
        const first = await open("owner", ["ana", "bia"]);
        const second = await open("bia", ["owner", "ana", "ana"]);
        const third = await open("ana", ["bia", "owner"]);

        expect(second.id).toBe(first.id);
        expect(third.id).toBe(first.id);
    });

    it("keeps a subset, a superset and the self conversation apart", async () => {
        const group = await open("owner", ["ana", "bia"]);
        const pair = await open("owner", ["ana"]);
        const bigger = await open("owner", ["ana", "bia", "caio"]);
        const self = await open("owner", []);
        const selfAgain = await open("owner", ["owner"]);

        expect(new Set([group.id, pair.id, bigger.id, self.id]).size).toBe(4);
        expect(selfAgain.id).toBe(self.id);
    });

    it("creates one conversation for concurrent calls on the same set", async () => {
        const results = await Promise.all(
            Array.from({ length: 4 }, () => open("owner", ["caio"]))
        );

        expect(new Set(results.map((result) => result.id)).size).toBe(1);
    });
});
