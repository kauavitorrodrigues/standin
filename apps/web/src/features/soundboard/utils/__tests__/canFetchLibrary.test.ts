import { describe, expect, it } from "vitest";
import { canFetchLibrary } from "../canFetchLibrary";

describe("canFetchLibrary", () => {
    it("waits for the organization of an organization's library", () => {
        expect(
            canFetchLibrary({ kind: "organization", organizationId: "" })
        ).toBe(false);
        expect(
            canFetchLibrary({ kind: "organization", organizationId: "org-1" })
        ).toBe(true);
    });

    it("does not wait for anything on the admin's", () => {
        expect(canFetchLibrary({ kind: "admin", organizationId: "" })).toBe(
            true
        );
    });
});
