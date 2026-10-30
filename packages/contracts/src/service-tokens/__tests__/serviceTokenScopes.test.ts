import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_SCOPES } from "../consts";
import {
    SERVICE_TOKEN_SCOPE_ACTIONS,
    SERVICE_TOKEN_SCOPE_RESOURCES,
    getServiceTokenScopeAction,
    getServiceTokenScopeResource,
    getServiceTokenScopesByResource,
    isServiceTokenScope,
} from "../utils/scopes";

describe("service token scope helpers", () => {
    it("reads the resource and the action of a scope", () => {
        expect(getServiceTokenScopeResource("maps:write")).toBe("maps");
        expect(getServiceTokenScopeAction("maps:write")).toBe("write");
        expect(getServiceTokenScopeResource("library:read")).toBe("library");
        expect(getServiceTokenScopeAction("templates:read")).toBe("read");
    });

    it("lists each resource and action once, from the scopes", () => {
        expect(SERVICE_TOKEN_SCOPE_RESOURCES).toEqual([
            "library",
            "maps",
            "templates",
        ]);
        expect(SERVICE_TOKEN_SCOPE_ACTIONS).toEqual(["read", "write"]);
    });

    it("groups the scopes of a resource", () => {
        expect(getServiceTokenScopesByResource("maps")).toEqual([
            "maps:read",
            "maps:write",
        ]);
    });

    it("splits every scope into a known resource and action", () => {
        for (const scope of SERVICE_TOKEN_SCOPES) {
            expect(SERVICE_TOKEN_SCOPE_RESOURCES).toContain(
                getServiceTokenScopeResource(scope)
            );
            expect(SERVICE_TOKEN_SCOPE_ACTIONS).toContain(
                getServiceTokenScopeAction(scope)
            );
        }
    });

    it("covers every scope through the groups, none twice", () => {
        const grouped = SERVICE_TOKEN_SCOPE_RESOURCES.flatMap(
            getServiceTokenScopesByResource
        );
        expect([...grouped].sort()).toEqual([...SERVICE_TOKEN_SCOPES].sort());
    });

    it("knows the scopes of the list and nothing else", () => {
        for (const scope of SERVICE_TOKEN_SCOPES) {
            expect(isServiceTokenScope(scope)).toBe(true);
        }
        for (const value of ["", "maps", "maps:", "maps:admin", "x:read"]) {
            expect(isServiceTokenScope(value)).toBe(false);
        }
    });

    it("has no resource or action for a string that is not a scope", () => {
        for (const value of ["", "nocolon", "maps:admin", "pins:read"]) {
            expect(getServiceTokenScopeResource(value)).toBeUndefined();
            expect(getServiceTokenScopeAction(value)).toBeUndefined();
        }
    });
});
