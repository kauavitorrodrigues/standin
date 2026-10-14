import { describe, expect, it } from "vitest";
import { shouldConnectPresence } from "../shouldConnectPresence";

describe("shouldConnectPresence", () => {
    it("connects with organization, space and user", () => {
        expect(
            shouldConnectPresence({
                organizationId: "org",
                spaceId: "space",
                userId: "me",
            })
        ).toBe(true);
    });

    it("does not connect without a space", () => {
        expect(
            shouldConnectPresence({
                organizationId: "org",
                spaceId: undefined,
                userId: "me",
            })
        ).toBe(false);
    });

    it("does not connect without a user", () => {
        expect(
            shouldConnectPresence({
                organizationId: "org",
                spaceId: "space",
                userId: undefined,
            })
        ).toBe(false);
    });
});
