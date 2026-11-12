import { describe, expect, it } from "vitest";
import type { RemotePlayer } from "@standin/contracts";
import {
    INITIAL_SAID_STATUSES,
    mergeRemoteStatuses,
    remoteStatusReducer,
} from "../remoteStatuses";

const lunch = { text: "Lunch", emoji: "🍕", expiresAt: null };

const peer = (userId: string, overrides: Partial<RemotePlayer> = {}) =>
    ({
        socketId: `socket-${userId}`,
        userId,
        avatarSheetFileId: null,
        name: userId,
        profilePictureUrl: null,
        muted: true,
        headphones: false,
        focus: false,
        availability: "active",
        customStatus: null,
        ...overrides,
    }) satisfies RemotePlayer;

describe("remoteStatusReducer", () => {
    it("keeps only the people who said something from the snapshot", () => {
        const state = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "snapshot-received",
            peers: [
                peer("quiet"),
                peer("away", { availability: "away" }),
                peer("text", { customStatus: lunch }),
            ],
        });

        expect([...state.keys()]).toEqual(["away", "text"]);
        expect(state.get("text")).toEqual({
            availability: "active",
            customStatus: lunch,
        });
    });

    it("treats a peer from an older server as saying nothing", () => {
        const old = peer("old") as Partial<RemotePlayer>;
        delete old.availability;
        delete old.customStatus;

        const state = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: old as RemotePlayer,
        });

        expect(state.size).toBe(0);
    });

    it("drops what it knew when a new snapshot arrives", () => {
        const known = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("old", { availability: "away" }),
        });

        const state = remoteStatusReducer(known, {
            type: "snapshot-received",
            peers: [],
        });

        expect(state.size).toBe(0);
    });

    it("adds the person who joins with a status", () => {
        const state = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("ana", { availability: "away" }),
        });

        expect(state.get("ana")?.availability).toBe("away");
    });

    it("follows a change and forgets a person who went back to nothing", () => {
        const away = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "status-received",
            payload: {
                socketId: "s",
                userId: "ana",
                availability: "away",
                customStatus: lunch,
            },
        });
        expect(away.get("ana")).toEqual({
            availability: "away",
            customStatus: lunch,
        });

        const cleared = remoteStatusReducer(away, {
            type: "status-received",
            payload: {
                socketId: "s",
                userId: "ana",
                availability: "active",
                customStatus: null,
            },
        });
        expect(cleared.has("ana")).toBe(false);
    });

    it("keeps the away when only the custom status ended", () => {
        const away = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("ana", { availability: "away", customStatus: lunch }),
        });

        const state = remoteStatusReducer(away, {
            type: "status-received",
            payload: {
                socketId: "s",
                userId: "ana",
                availability: "away",
                customStatus: null,
            },
        });

        expect(state.get("ana")).toEqual({
            availability: "away",
            customStatus: null,
        });
    });

    it("forgets the person who left, and ignores one it never knew", () => {
        const known = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("ana", { availability: "away" }),
        });

        expect(
            remoteStatusReducer(known, { type: "peer-left", userId: "ana" })
                .size
        ).toBe(0);
        expect(
            remoteStatusReducer(known, { type: "peer-left", userId: "bob" })
        ).toBe(known);
    });

    it("resets", () => {
        const known = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("ana", { availability: "away" }),
        });

        expect(remoteStatusReducer(known, { type: "reset" }).size).toBe(0);
    });
});

describe("mergeRemoteStatuses", () => {
    it("shows busy for the people with headphones, even if they said nothing", () => {
        const merged = mergeRemoteStatuses(INITIAL_SAID_STATUSES, ["ana"]);

        expect(merged.get("ana")).toEqual({
            availability: "busy",
            customStatus: null,
        });
    });

    it("lets busy win over away and keeps the custom status", () => {
        const said = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("ana", { availability: "away", customStatus: lunch }),
        });

        expect(mergeRemoteStatuses(said, ["ana"]).get("ana")).toEqual({
            availability: "busy",
            customStatus: lunch,
        });
    });

    it("leaves the others as they said", () => {
        const said = remoteStatusReducer(INITIAL_SAID_STATUSES, {
            type: "peer-joined",
            peer: peer("bob", { availability: "away" }),
        });

        expect(mergeRemoteStatuses(said, []).get("bob")?.availability).toBe(
            "away"
        );
    });
});
