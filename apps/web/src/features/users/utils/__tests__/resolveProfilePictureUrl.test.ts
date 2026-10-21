import { describe, expect, it } from "vitest";
import { resolveProfilePictureUrl } from "../resolveProfilePictureUrl";

describe("resolveProfilePictureUrl", () => {
    it("puts the address of the API in front of the path", () => {
        expect(
            resolveProfilePictureUrl("/files/x", "http://localhost:3001")
        ).toBe("http://localhost:3001/files/x");
    });

    it("goes through the prefix of the API in LAN mode", () => {
        expect(resolveProfilePictureUrl("/files/x", "/api")).toBe(
            "/api/files/x"
        );
    });

    it("gives undefined with no picture, so the initial shows", () => {
        expect(resolveProfilePictureUrl(null, "/api")).toBeUndefined();
        expect(resolveProfilePictureUrl(undefined, "/api")).toBeUndefined();
        expect(resolveProfilePictureUrl("", "/api")).toBeUndefined();
    });
});
