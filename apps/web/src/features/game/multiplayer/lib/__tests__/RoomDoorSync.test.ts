import { describe, expect, it, vi } from "vitest";
import { RoomDoorSync } from "../RoomDoorSync";

const build = () => {
    const emit = vi.fn();
    return { emit, sync: new RoomDoorSync({ emit }) };
};

describe("RoomDoorSync", () => {
    it("treats a missing room as open", () => {
        const { sync } = build();
        expect(sync.getState("a")).toBe("open");
    });

    it("replaces everything on room:states", () => {
        const { sync } = build();
        sync.applyState({ roomKey: "a", state: "locked" });
        sync.applyStates({ rooms: [{ roomKey: "b", state: "closed" }] });
        expect(sync.getState("a")).toBe("open");
        expect(sync.getState("b")).toBe("closed");
        expect(sync.getStates().size).toBe(1);
    });

    it("applies one room and drops it when it opens", () => {
        const { sync } = build();
        sync.applyState({ roomKey: "a", state: "locked" });
        expect(sync.getStates().get("a")).toBe("locked");
        sync.applyState({ roomKey: "a", state: "open" });
        expect(sync.getStates().has("a")).toBe(false);
    });

    it("notifies subscribers with a new snapshot until they unsubscribe", () => {
        const { sync } = build();
        const listener = vi.fn();
        const unsubscribe = sync.subscribe(listener);
        const before = sync.getStates();
        sync.applyState({ roomKey: "a", state: "closed" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(sync.getStates()).not.toBe(before);
        unsubscribe();
        sync.applyStates({ rooms: [] });
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits the four client events", () => {
        const { sync, emit } = build();
        sync.crossed("a", "in");
        sync.open("a");
        sync.lock("a");
        sync.unlock("a");
        expect(emit.mock.calls).toEqual([
            ["room:crossed", { roomKey: "a", direction: "in" }],
            ["room:open", { roomKey: "a" }],
            ["room:lock", { roomKey: "a" }],
            ["room:unlock", { roomKey: "a" }],
        ]);
    });

    it("emits the presence of the avatar and tells snapshot listeners", () => {
        const { sync, emit } = build();
        const listener = vi.fn();
        sync.subscribeSnapshot(listener);
        sync.present("a");
        expect(emit).toHaveBeenCalledWith("room:present", { roomKey: "a" });
        sync.applyState({ roomKey: "a", state: "closed" });
        expect(listener).not.toHaveBeenCalled();
        sync.applyStates({ rooms: [] });
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits the join request and the answer", () => {
        const { sync, emit } = build();
        sync.requestJoin("a");
        sync.answerJoin("a", "u1", true);
        expect(emit).toHaveBeenCalledWith("room:join-request", {
            roomKey: "a",
        });
        expect(emit).toHaveBeenCalledWith("room:join-answer", {
            roomKey: "a",
            userId: "u1",
            accept: true,
        });
    });

    it("tracks pending requests until they are cancelled", () => {
        const { sync } = build();
        const listener = vi.fn();
        sync.subscribeJoinRequests(listener);
        sync.applyJoinRequested({ roomKey: "a", userId: "u1" });
        sync.applyJoinRequested({ roomKey: "a", userId: "u1" });
        sync.applyJoinRequested({ roomKey: "a", userId: "u2" });
        expect(sync.getJoinRequests()).toEqual([
            { roomKey: "a", userId: "u1" },
            { roomKey: "a", userId: "u2" },
        ]);
        sync.applyJoinCancelled({ roomKey: "a", userId: "u1" });
        sync.applyJoinCancelled({ roomKey: "a", userId: "zz" });
        expect(sync.getJoinRequests()).toEqual([
            { roomKey: "a", userId: "u2" },
        ]);
        expect(listener).toHaveBeenCalledTimes(3);
    });

    it("replaces the entitlements on every event", () => {
        const { sync } = build();
        const listener = vi.fn();
        sync.subscribeEntitlements(listener);
        expect(sync.getEntitlements().all).toBe(false);
        sync.applyEntitlements({ all: false, roomKeys: ["a"] });
        sync.applyEntitlements({ all: true, roomKeys: ["b"] });
        const { all, roomKeys } = sync.getEntitlements();
        expect(all).toBe(true);
        expect([...roomKeys]).toEqual(["b"]);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it("forwards decisions until unsubscribed", () => {
        const { sync } = build();
        const listener = vi.fn();
        const unsubscribe = sync.subscribeDecision(listener);
        sync.applyDecision({ roomKey: "a", accepted: true });
        unsubscribe();
        sync.applyDecision({ roomKey: "a", accepted: false });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith({ roomKey: "a", accepted: true });
    });
});
