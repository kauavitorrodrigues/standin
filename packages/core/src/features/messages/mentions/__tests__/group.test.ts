import { describe, expect, it } from "vitest";
import { groupMentionsByMessage, namesByUserId } from "../group";

describe("groupMentionsByMessage", () => {
    it("groups the mentions of a page by message, in order", () => {
        const grouped = groupMentionsByMessage([
            { messageId: "m1", userId: "a", name: "Ana" },
            { messageId: "m2", userId: "b", name: "Bia" },
            { messageId: "m1", userId: "c", name: "Caio" },
        ]);

        expect(grouped.get("m1")).toEqual([
            { userId: "a", name: "Ana" },
            { userId: "c", name: "Caio" },
        ]);
        expect(grouped.get("m2")).toEqual([{ userId: "b", name: "Bia" }]);
        expect(grouped.get("m3")).toBeUndefined();
    });
});

describe("namesByUserId", () => {
    it("looks a name up by the id of the person", () => {
        expect(namesByUserId([{ userId: "a", name: "Ana" }]).get("a")).toBe(
            "Ana"
        );
    });
});
