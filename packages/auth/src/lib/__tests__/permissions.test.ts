import { describe, expect, it } from "vitest";
import { ROLES, USER_ROLES } from "@standin/contracts";
import { hasPermission } from "../can";
import { resolveRoles } from "../resolveRoles";

describe("resolveRoles", () => {
    it("adds ADMIN for admins, on top of the organization role", () => {
        expect(resolveRoles({ role: USER_ROLES.ADMIN })).toEqual([
            ROLES.ADMIN,
            ROLES.MEMBER,
        ]);
        expect(resolveRoles({ role: USER_ROLES.ADMIN }, ROLES.OWNER)).toEqual([
            ROLES.ADMIN,
            ROLES.OWNER,
        ]);
    });

    it("resolves the organization role for regular users", () => {
        expect(resolveRoles({ role: USER_ROLES.USER }, ROLES.OWNER)).toEqual([
            ROLES.OWNER,
        ]);
        expect(resolveRoles({ role: USER_ROLES.USER }, ROLES.MEMBER)).toEqual([
            ROLES.MEMBER,
        ]);
    });

    it("treats users without membership as MEMBER", () => {
        expect(resolveRoles({ role: USER_ROLES.USER })).toEqual([ROLES.MEMBER]);
    });
});

describe("hasPermission", () => {
    it("lets only the owner build spaces, never the admin alone", () => {
        expect(hasPermission([ROLES.OWNER], "create", "space")).toBe(true);
        expect(hasPermission([ROLES.MEMBER], "create", "space")).toBe(false);
        expect(
            hasPermission([ROLES.ADMIN, ROLES.MEMBER], "create", "space")
        ).toBe(false);
        expect(
            hasPermission([ROLES.ADMIN, ROLES.OWNER], "create", "space")
        ).toBe(true);
    });

    it("lets any role create an organization but only the owner edit it", () => {
        expect(hasPermission([ROLES.MEMBER], "create", "organization")).toBe(
            true
        );
        expect(hasPermission([ROLES.MEMBER], "update", "organization")).toBe(
            false
        );
        expect(hasPermission([ROLES.OWNER], "update", "organization")).toBe(
            true
        );
    });
});
