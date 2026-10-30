import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_SCOPE_PRESETS } from "../../consts/scopePresets";
import { getActivePreset } from "../getActivePreset";
import { toggleScope } from "../toggleScope";

describe("getActivePreset", () => {
    it("matches each preset with its own scopes", () => {
        for (const preset of SERVICE_TOKEN_SCOPE_PRESETS) {
            expect(getActivePreset(preset.scopes)?.id).toBe(preset.id);
        }
    });

    it("ignores the order of the selection", () => {
        expect(getActivePreset(["templates:write", "library:write"])?.id).toBe(
            "content"
        );
    });

    it("matches nothing for a partial or empty selection", () => {
        expect(getActivePreset([])).toBeNull();
        expect(getActivePreset(["library:write"])).toBeNull();
    });

    it("gives access to every scope in the full preset", () => {
        const all = SERVICE_TOKEN_SCOPE_PRESETS.find((p) => p.id === "all");
        expect([...(all?.scopes ?? [])].sort()).toEqual(
            [...SERVICE_TOKEN_SCOPES].sort()
        );
    });

    it("only offers scopes that exist", () => {
        for (const preset of SERVICE_TOKEN_SCOPE_PRESETS) {
            for (const scope of preset.scopes) {
                expect(SERVICE_TOKEN_SCOPES).toContain(scope);
            }
        }
    });
});

describe("toggleScope", () => {
    it("adds a missing scope and removes a selected one", () => {
        expect(toggleScope([], "maps:write")).toEqual(["maps:write"]);
        expect(toggleScope(["maps:write"], "maps:write")).toEqual([]);
    });
});
