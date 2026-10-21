import { describe, expect, it } from "vitest";
import { toUser } from "../toUser";
import { toUserSummary } from "../toUserSummary";

describe("toUser", () => {
    const row = {
        id: "u1",
        name: "Ana",
        email: "ana@example.com",
        role: "USER" as const,
    };

    it("builds the profile picture URL from the file id", () => {
        expect(toUser({ ...row, profilePictureFileId: "f1" })).toEqual({
            ...row,
            profilePictureUrl: "/files/f1",
        });
    });

    it("gives null with no picture", () => {
        expect(toUser({ ...row, profilePictureFileId: null })).toEqual({
            ...row,
            profilePictureUrl: null,
        });
    });

    it("does not leak the file id", () => {
        expect(
            toUser({ ...row, profilePictureFileId: "f1" })
        ).not.toHaveProperty("profilePictureFileId");
    });
});

describe("toUserSummary", () => {
    it("builds the profile picture URL from the file id", () => {
        expect(
            toUserSummary({ id: "u1", name: "Ana", profilePictureFileId: "f1" })
        ).toEqual({ id: "u1", name: "Ana", profilePictureUrl: "/files/f1" });
    });

    it("gives null with no picture", () => {
        expect(
            toUserSummary({
                id: "u1",
                name: "Ana",
                profilePictureFileId: null,
            })
        ).toEqual({ id: "u1", name: "Ana", profilePictureUrl: null });
    });
});
