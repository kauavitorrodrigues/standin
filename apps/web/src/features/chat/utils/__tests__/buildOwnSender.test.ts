import { describe, expect, it } from "vitest";
import { buildOwnSender } from "../buildOwnSender";

describe("buildOwnSender", () => {
    it("carries the picture of the signed in person", () => {
        expect(
            buildOwnSender({
                id: "u1",
                name: "Ana",
                profilePictureUrl: "/files/f1",
            })
        ).toEqual({ id: "u1", name: "Ana", profilePictureUrl: "/files/f1" });
    });

    it("keeps null when there is no picture", () => {
        expect(
            buildOwnSender({ id: "u1", name: "Ana", profilePictureUrl: null })
                .profilePictureUrl
        ).toBeNull();
    });
});
