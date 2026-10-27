import { beforeEach, describe, expect, it } from "vitest";
import { PresenceStore, type PresenceEntry } from "../PresenceStore";

const entry = (socketId: string, userId: string): PresenceEntry => ({
    socketId,
    userId,
    name: userId,
    profilePictureUrl: null,
    avatarSheetFileId: null,
});

describe("PresenceStore", () => {
    beforeEach(() => PresenceStore.clear());

    it("lists who is in a space and nobody in an empty one", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", entry("s2", "u2"));

        expect(PresenceStore.list("space-1").map((e) => e.socketId)).toEqual([
            "s1",
            "s2",
        ]);
        expect(PresenceStore.list("space-2")).toEqual([]);
    });

    it("finds every connection of a person in a space", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", entry("s2", "u1"));
        PresenceStore.add("space-1", entry("s3", "u2"));

        expect(PresenceStore.findSocketIdsOfUser("space-1", "u1")).toEqual([
            "s1",
            "s2",
        ]);
    });

    it("replaces the entry of a socket that joins twice", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", { ...entry("s1", "u1"), name: "New" });

        expect(PresenceStore.size("space-1")).toBe(1);
        expect(PresenceStore.get("space-1", "s1")?.name).toBe("New");
    });

    it("removes a socket and forgets an emptied space", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));

        expect(PresenceStore.remove("space-1", "s1")?.userId).toBe("u1");
        expect(PresenceStore.remove("space-1", "s1")).toBeUndefined();
        expect(PresenceStore.findSpaceIdsOfUser("u1")).toEqual([]);
        expect(PresenceStore.size("space-1")).toBe(0);
    });

    it("updates a person in every space and returns those spaces", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-2", entry("s2", "u1"));
        PresenceStore.add("space-2", entry("s3", "u2"));

        const spaceIds = PresenceStore.updateUser("u1", { name: "Ana" });

        expect(spaceIds.sort()).toEqual(["space-1", "space-2"]);
        expect(PresenceStore.get("space-1", "s1")?.name).toBe("Ana");
        expect(PresenceStore.get("space-2", "s2")?.name).toBe("Ana");
        expect(PresenceStore.get("space-2", "s3")?.name).toBe("u2");
    });
});
