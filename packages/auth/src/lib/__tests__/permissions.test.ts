import { describe, expect, it } from "vitest";
import { ROLES, USER_ROLES } from "@standin/contracts";
import { hasPermission } from "../can";
import { resolveRole } from "../resolveRole";

describe("resolveRole", () => {
    it("always resolves admins to ADMIN", () => {
        expect(resolveRole({ role: USER_ROLES.ADMIN }, ROLES.MEMBER)).toBe(
            ROLES.ADMIN
        );
        expect(resolveRole({ role: USER_ROLES.ADMIN })).toBe(ROLES.ADMIN);
    });

    it("resolves the organization role for regular users", () => {
        expect(resolveRole({ role: USER_ROLES.USER }, ROLES.OWNER)).toBe(
            ROLES.OWNER
        );
        expect(resolveRole({ role: USER_ROLES.USER }, ROLES.MEMBER)).toBe(
            ROLES.MEMBER
        );
    });

    it("treats users without membership as MEMBER", () => {
        expect(resolveRole({ role: USER_ROLES.USER })).toBe(ROLES.MEMBER);
    });
});

describe("hasPermission", () => {
    it("lets owners and admins manage spaces, but not members", () => {
        expect(hasPermission(ROLES.ADMIN, "create", "space")).toBe(true);
        expect(hasPermission(ROLES.OWNER, "delete", "space")).toBe(true);
        expect(hasPermission(ROLES.MEMBER, "create", "space")).toBe(false);
        expect(hasPermission(ROLES.MEMBER, "read", "space")).toBe(true);
    });

    it("lets any role create an organization but only managers edit it", () => {
        expect(hasPermission(ROLES.MEMBER, "create", "organization")).toBe(
            true
        );
        expect(hasPermission(ROLES.MEMBER, "update", "organization")).toBe(
            false
        );
        expect(hasPermission(ROLES.OWNER, "update", "organization")).toBe(true);
    });
});
