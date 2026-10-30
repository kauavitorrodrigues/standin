import { describe, expect, it } from "vitest";
import { getTokenActions } from "../getTokenActions";

describe("getTokenActions", () => {
    it("allows everything for an active token", () => {
        expect(getTokenActions("active")).toEqual({
            canRegenerate: true,
            canRevoke: true,
            canDelete: true,
        });
    });

    it.each(["expired", "revoked"] as const)(
        "allows only delete for a %s token",
        (status) => {
            expect(getTokenActions(status)).toEqual({
                canRegenerate: false,
                canRevoke: false,
                canDelete: true,
            });
        }
    );
});
