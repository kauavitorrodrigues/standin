import { describe, expect, it } from "vitest";
import { PendingProfilePictures } from "../PendingProfilePictures";

describe("PendingProfilePictures", () => {
    it("gives the fallback when nothing is pending", () => {
        expect(new PendingProfilePictures().take("u1", "/files/a")).toBe(
            "/files/a"
        );
    });

    it("prefers the picture that arrived over the one of the profile", () => {
        const pending = new PendingProfilePictures();
        pending.set("u1", "/files/b");

        expect(pending.take("u1", "/files/a")).toBe("/files/b");
    });

    it("treats a removed picture (null) as a picture that arrived", () => {
        const pending = new PendingProfilePictures();
        pending.set("u1", null);

        expect(pending.take("u1", "/files/a")).toBeNull();
    });

    it("keeps the last picture that arrived", () => {
        const pending = new PendingProfilePictures();
        pending.set("u1", "/files/b");
        pending.set("u1", "/files/c");

        expect(pending.take("u1", null)).toBe("/files/c");
    });

    it("uses a pending picture once", () => {
        const pending = new PendingProfilePictures();
        pending.set("u1", "/files/b");
        pending.take("u1", null);

        expect(pending.take("u1", "/files/a")).toBe("/files/a");
    });

    it("forgets the picture of a person who left before their avatar was made", () => {
        const pending = new PendingProfilePictures();
        pending.set("u1", "/files/b");
        pending.forget("u1");

        expect(pending.take("u1", "/files/a")).toBe("/files/a");
    });
});
