import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import {
    getScopeCheckedState,
    getScopesOfAction,
    setScopes,
} from "../scopeSelection";

describe("getScopesOfAction", () => {
    it("lists the scopes of one action across the resources", () => {
        expect(getScopesOfAction("read")).toEqual([
            "library:read",
            "maps:read",
            "templates:read",
        ]);
        expect(getScopesOfAction("write")).toEqual([
            "library:write",
            "maps:write",
            "templates:write",
        ]);
    });

    it("splits the whole list between the actions", () => {
        const all = [
            ...getScopesOfAction("read"),
            ...getScopesOfAction("write"),
        ];
        expect(all.sort()).toEqual([...SERVICE_TOKEN_SCOPES].sort());
    });
});

describe("getScopeCheckedState", () => {
    const row = ["maps:read", "maps:write"] as const;

    it("is unchecked when none is selected", () => {
        expect(getScopeCheckedState([], row)).toEqual({
            checked: false,
            indeterminate: false,
        });
    });

    it("is indeterminate when some are selected", () => {
        expect(
            getScopeCheckedState(["maps:read", "library:read"], row)
        ).toEqual({ checked: false, indeterminate: true });
    });

    it("is checked when all are selected, in any order", () => {
        expect(getScopeCheckedState(["maps:write", "maps:read"], row)).toEqual({
            checked: true,
            indeterminate: false,
        });
    });

    it("is never checked for an empty set", () => {
        expect(getScopeCheckedState(["maps:read"], [])).toEqual({
            checked: false,
            indeterminate: false,
        });
    });
});

describe("setScopes", () => {
    it("adds scopes and keeps the rest", () => {
        expect(
            setScopes(["library:read"], ["maps:read", "maps:write"], true)
        ).toEqual(["library:read", "maps:read", "maps:write"]);
    });

    it("keeps the order of the list, whatever order they were added in", () => {
        const selected = setScopes(
            setScopes(["templates:read"], ["maps:write"], true),
            ["library:read"],
            true
        );
        expect(selected).toEqual([
            "library:read",
            "maps:write",
            "templates:read",
        ]);
    });

    it("never repeats a scope, even when the input does", () => {
        expect(
            setScopes(["maps:read", "maps:read"], ["maps:read"], true)
        ).toEqual(["maps:read"]);
    });

    it("does not repeat a scope already selected", () => {
        expect(
            setScopes(["maps:read"], ["maps:read", "maps:write"], true)
        ).toEqual(["maps:read", "maps:write"]);
    });

    it("removes scopes and keeps the rest", () => {
        expect(
            setScopes(
                ["library:read", "maps:read", "maps:write"],
                ["maps:read", "maps:write"],
                false
            )
        ).toEqual(["library:read"]);
    });

    it("does not change the selection it was given", () => {
        const selected = ["maps:read"] as const;
        setScopes(selected, ["maps:write"], true);
        expect(selected).toEqual(["maps:read"]);
    });
});
