import { describe, expect, it } from "vitest";
import {
    EMPTY_VIEWERS,
    applyActiveObject,
    applyObjectClosed,
    applyPeerLeft,
    listViewerIds,
    replaceViewers,
} from "../websiteViewers";

const snapshot = [
    { socketId: "s1", userId: "ana", objectId: "a" },
    { socketId: "s2", userId: "bia", objectId: "a" },
    { socketId: "s3", userId: "caio", objectId: "b" },
];

describe("websiteViewers", () => {
    it("takes the snapshot of a join as the whole truth", () => {
        const state = replaceViewers(snapshot);

        expect(state.size).toBe(3);
        expect(replaceViewers([])).toEqual(EMPTY_VIEWERS);
    });

    it("follows a person who opens, moves to another and closes", () => {
        let state = applyActiveObject(EMPTY_VIEWERS, {
            socketId: "s1",
            userId: "ana",
            objectId: "a",
        });
        expect(state.get("s1")).toEqual({ userId: "ana", objectId: "a" });

        state = applyActiveObject(state, {
            socketId: "s1",
            userId: "ana",
            objectId: "b",
        });
        expect(state.get("s1")?.objectId).toBe("b");

        state = applyActiveObject(state, {
            socketId: "s1",
            userId: "ana",
            objectId: null,
        });
        expect(state.size).toBe(0);
    });

    it("does not change the state it was given", () => {
        const state = replaceViewers(snapshot);

        applyActiveObject(state, {
            socketId: "s1",
            userId: "ana",
            objectId: null,
        });
        applyObjectClosed(state, "a");
        applyPeerLeft(state, "s1");

        expect(state.size).toBe(3);
    });

    it("drops everyone looking at an object that was closed for them", () => {
        const state = applyObjectClosed(replaceViewers(snapshot), "a");

        expect([...state.keys()]).toEqual(["s3"]);
    });

    it("drops a person who left and keeps the state when nobody did", () => {
        const state = replaceViewers(snapshot);

        expect(applyPeerLeft(state, "s2").has("s2")).toBe(false);
        expect(applyPeerLeft(state, "nobody")).toBe(state);
    });

    describe("listViewerIds", () => {
        it("lists who looks at the object, without repeating a person", () => {
            const state = replaceViewers([
                ...snapshot,
                { socketId: "s4", userId: "ana", objectId: "a" },
            ]);

            expect(listViewerIds(state, "a", "me", false)).toEqual([
                "ana",
                "bia",
            ]);
        });

        it("puts the local person first when they are looking", () => {
            const state = replaceViewers(snapshot);

            expect(listViewerIds(state, "a", "me", true)).toEqual([
                "me",
                "ana",
                "bia",
            ]);
        });

        it("does not count the local person twice with another tab open", () => {
            const state = replaceViewers([
                { socketId: "s9", userId: "me", objectId: "a" },
            ]);

            expect(listViewerIds(state, "a", "me", true)).toEqual(["me"]);
            expect(listViewerIds(state, "a", "me", false)).toEqual([]);
        });

        it("lists nobody for an object nobody looks at", () => {
            expect(
                listViewerIds(replaceViewers(snapshot), "c", "me", false)
            ).toEqual([]);
        });
    });
});
