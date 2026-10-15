import { beforeEach, describe, expect, it } from "vitest";
import { RoomStates } from "../roomStates";

const s = "s1";
const key = "media";

// "sa" is user "a" inside, "sb" is user "b" outside.
const lockedWithA = () => {
    RoomStates.cross(s, key, "sa", "a", "in");
    RoomStates.lock(s, key, "sa");
};

describe("room join requests in the store", () => {
    beforeEach(() => RoomStates.clear());

    it("lets only the owner and accepted users cross in while locked", () => {
        lockedWithA();
        expect(RoomStates.cross(s, key, "sb", "b", "in").accepted).toBe(false);

        RoomStates.setOwner(s, "so");
        const owner = RoomStates.cross(s, key, "so", "o", "in");
        expect(owner.accepted).toBe(true);
        expect(owner.state).toBe("locked");
        expect(owner.changed).toBe(false);
    });

    it("only requests when locked, outside, not entitled and someone is inside", () => {
        expect(RoomStates.requestJoin(s, key, "sb", "b")).toBeNull();
        RoomStates.cross(s, key, "sa", "a", "in");
        expect(RoomStates.requestJoin(s, key, "sb", "b")).toBeNull();
        RoomStates.lock(s, key, "sa");
        expect(RoomStates.requestJoin(s, key, "sa", "a")).toBeNull();
        expect(RoomStates.requestJoin(s, key, "sb", "b")).toEqual({ notify: ["sa"] });
        expect(RoomStates.requestJoin(s, key, "sb", "b")).toBeNull();

        RoomStates.setOwner(s, "so");
        expect(RoomStates.requestJoin(s, key, "so", "o")).toBeNull();
    });

    it("answers only from inside and only once", () => {
        lockedWithA();
        RoomStates.requestJoin(s, key, "sb", "b");
        expect(RoomStates.answerJoin(s, key, "sc", "b", true)).toBeNull();
        expect(RoomStates.answerJoin(s, key, "sa", "x", true)).toBeNull();
        expect(RoomStates.answerJoin(s, key, "sa", "b", true)).toEqual({
            requesterSocketId: "sb",
            notify: ["sa"],
        });
        expect(RoomStates.answerJoin(s, key, "sa", "b", false)).toBeNull();
        expect(RoomStates.entitlements(s, "sb", "b")).toEqual({
            all: false,
            roomKeys: [key],
        });
    });

    it("keeps nothing when declined", () => {
        lockedWithA();
        RoomStates.requestJoin(s, key, "sb", "b");
        RoomStates.answerJoin(s, key, "sa", "b", false);
        expect(RoomStates.entitlements(s, "sb", "b").roomKeys).toEqual([]);
        expect(RoomStates.cross(s, key, "sb", "b", "in").accepted).toBe(false);
    });

    it("cancels a request when the requester enters, disconnects or the room unlocks", () => {
        lockedWithA();
        RoomStates.requestJoin(s, key, "sb", "b");
        RoomStates.answerJoin(s, key, "sa", "b", true);
        RoomStates.requestJoin(s, key, "sc", "c");
        const gone = RoomStates.removeSocket(s, "sc");
        expect(gone.effects.cancelled).toEqual([
            { roomKey: key, userId: "c", notify: ["sa"] },
        ]);

        RoomStates.requestJoin(s, key, "sd", "d");
        const unlocked = RoomStates.unlock(s, key, "sa");
        expect(unlocked.effects.cancelled).toEqual([
            { roomKey: key, userId: "d", notify: ["sa"] },
        ]);

        RoomStates.lock(s, key, "sa");
        RoomStates.requestJoin(s, key, "se", "e");
        RoomStates.setOwner(s, "se");
        const entered = RoomStates.cross(s, key, "se", "e", "in");
        expect(entered.effects.cancelled).toHaveLength(1);
    });

    it("ends the meeting when the room is empty", () => {
        lockedWithA();
        RoomStates.requestJoin(s, key, "sb", "b");
        RoomStates.answerJoin(s, key, "sa", "b", true);
        RoomStates.cross(s, key, "sb", "b", "in");

        RoomStates.cross(s, key, "sa", "a", "out");
        const last = RoomStates.cross(s, key, "sb", "b", "out");
        expect(last.effects.lostUsers).toEqual(["b"]);
        expect(RoomStates.entitlements(s, "sb", "b").roomKeys).toEqual([]);
    });

    it("clears the accepted users when the last socket disconnects", () => {
        lockedWithA();
        RoomStates.requestJoin(s, key, "sb", "b");
        RoomStates.answerJoin(s, key, "sa", "b", true);
        const removal = RoomStates.removeSocket(s, "sa");
        expect(removal.effects.lostUsers).toEqual(["b"]);
        expect(removal.changes).toEqual([{ roomKey: key, state: "open" }]);
    });
});
