import { beforeEach, describe, expect, it } from "vitest";
import { PresenceStore, type PresenceEntry } from "../PresenceStore";

const entry = (socketId: string, userId: string): PresenceEntry => ({
    socketId,
    userId,
    name: userId,
    profilePictureUrl: null,
    avatarSheetFileId: null,
    muted: true,
    headphones: false,
    focus: false,
    announcingSince: null,
    sharingVideoWithAnnouncerSince: null,
    handRaisedSince: null,
    activeInteractionObjectId: null,
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

    it("stores the privacy flags and tells whether they changed", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        const privacy = { headphones: true, focus: false };

        expect(PresenceStore.setPrivacy("space-1", "s1", privacy)).toBe(true);
        expect(PresenceStore.get("space-1", "s1")?.headphones).toBe(true);
        expect(PresenceStore.setPrivacy("space-1", "s1", privacy)).toBe(false);
        expect(PresenceStore.setPrivacy("space-1", "nobody", privacy)).toBe(
            false
        );
    });

    it("keeps the first start of an announcement and lists the oldest first", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", entry("s2", "u2"));
        PresenceStore.add("space-1", entry("s3", "u3"));

        expect(PresenceStore.setAnnouncing("space-1", "s2", 100)).toBe(true);
        expect(PresenceStore.setAnnouncing("space-1", "s2", 500)).toBe(false);
        expect(PresenceStore.setAnnouncing("space-1", "s1", 300)).toBe(true);

        expect(
            PresenceStore.listAnnouncers("space-1").map((e) => e.socketId)
        ).toEqual(["s2", "s1"]);
        expect(PresenceStore.get("space-1", "s2")?.announcingSince).toBe(100);
    });

    it("stops announcing and ignores a socket that is not there", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.setAnnouncing("space-1", "s1", 100);

        expect(PresenceStore.setAnnouncing("space-1", "s1", null)).toBe(true);
        expect(PresenceStore.setAnnouncing("space-1", "s1", null)).toBe(false);
        expect(PresenceStore.setAnnouncing("space-1", "nobody", 1)).toBe(false);
        expect(PresenceStore.listAnnouncers("space-1")).toEqual([]);
    });

    it("keeps the first time of a raised hand and lists the oldest first", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", entry("s2", "u2"));

        expect(PresenceStore.setHandRaised("space-1", "s2", 100)).toBe(true);
        expect(PresenceStore.setHandRaised("space-1", "s2", 500)).toBe(false);
        expect(PresenceStore.setHandRaised("space-1", "s1", 300)).toBe(true);

        expect(
            PresenceStore.listRaisedHands("space-1").map((e) => e.socketId)
        ).toEqual(["s2", "s1"]);
        expect(PresenceStore.get("space-1", "s2")?.handRaisedSince).toBe(100);
    });

    it("lowers a hand and ignores a socket that is not there", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.setHandRaised("space-1", "s1", 100);

        expect(PresenceStore.setHandRaised("space-1", "s1", null)).toBe(true);
        expect(PresenceStore.setHandRaised("space-1", "s1", null)).toBe(false);
        expect(PresenceStore.setHandRaised("space-1", "nobody", 1)).toBe(false);
        expect(PresenceStore.listRaisedHands("space-1")).toEqual([]);
    });

    it("opens and closes an object for one socket", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));

        expect(PresenceStore.setActiveObject("space-1", "s1", "obj")).toBe(
            true
        );
        expect(PresenceStore.setActiveObject("space-1", "s1", "obj")).toBe(
            false
        );
        expect(
            PresenceStore.get("space-1", "s1")?.activeInteractionObjectId
        ).toBe("obj");

        expect(PresenceStore.setActiveObject("space-1", "s1", null)).toBe(true);
        expect(PresenceStore.setActiveObject("space-1", "nobody", "obj")).toBe(
            false
        );
        expect(PresenceStore.listActiveObjects("space-1")).toEqual([]);
    });

    it("lists who has an object open and clears one object for its viewers", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.add("space-1", entry("s2", "u2"));
        PresenceStore.add("space-1", entry("s3", "u3"));
        PresenceStore.setActiveObject("space-1", "s1", "a");
        PresenceStore.setActiveObject("space-1", "s2", "a");
        PresenceStore.setActiveObject("space-1", "s3", "b");

        expect(
            PresenceStore.listActiveObjects("space-1").map((e) => e.socketId)
        ).toEqual(["s1", "s2", "s3"]);

        const cleared = PresenceStore.clearActiveObject("space-1", "a");

        expect(cleared.map((e) => e.socketId)).toEqual(["s1", "s2"]);
        expect(
            PresenceStore.listActiveObjects("space-1").map((e) => e.socketId)
        ).toEqual(["s3"]);
    });

    it("drops the open object together with the socket", () => {
        PresenceStore.add("space-1", entry("s1", "u1"));
        PresenceStore.setActiveObject("space-1", "s1", "a");

        PresenceStore.remove("space-1", "s1");

        expect(PresenceStore.listActiveObjects("space-1")).toEqual([]);
    });
});
