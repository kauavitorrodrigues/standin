import { describe, expect, it } from "vitest";
import { PendingUserNames } from "../PendingUserNames";

describe("PendingUserNames", () => {
    it("gives the fallback when nothing is pending", () => {
        expect(new PendingUserNames().take("u1", "Ana")).toBe("Ana");
    });

    it("prefers the name that arrived over the one of the profile", () => {
        const pending = new PendingUserNames();
        pending.set("u1", "Ana Souza");

        expect(pending.take("u1", "Ana")).toBe("Ana Souza");
    });

    it("keeps the last name that arrived", () => {
        const pending = new PendingUserNames();
        pending.set("u1", "Ana S.");
        pending.set("u1", "Ana Souza");

        expect(pending.take("u1", "Ana")).toBe("Ana Souza");
    });

    it("uses a pending name once", () => {
        const pending = new PendingUserNames();
        pending.set("u1", "Ana Souza");
        pending.take("u1", "Ana");

        expect(pending.take("u1", "Ana")).toBe("Ana");
    });

    it("keeps the names of different people apart", () => {
        const pending = new PendingUserNames();
        pending.set("u1", "Ana Souza");

        expect(pending.take("u2", "Bruno")).toBe("Bruno");
    });

    it("forgets the name of a person who left before their avatar was made", () => {
        const pending = new PendingUserNames();
        pending.set("u1", "Ana Souza");
        pending.forget("u1");

        expect(pending.take("u1", "Ana")).toBe("Ana");
    });
});
