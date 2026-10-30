import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_SCOPE_META } from "../../consts/scopes";

// A new scope in the contracts fails here until it gets its label,
// description and icon.
describe("SERVICE_TOKEN_SCOPE_META", () => {
    it("covers every scope of the contracts and nothing more", () => {
        expect(Object.keys(SERVICE_TOKEN_SCOPE_META).sort()).toEqual(
            [...SERVICE_TOKEN_SCOPES].sort()
        );
    });

    it("gives each scope a label, a description and an icon", () => {
        for (const scope of SERVICE_TOKEN_SCOPES) {
            const meta = SERVICE_TOKEN_SCOPE_META[scope];
            expect(meta.label).not.toBe("");
            expect(meta.description).not.toBe("");
            expect(meta.icon).toBeDefined();
        }
    });
});
