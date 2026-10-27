import { describe, expect, it, vi } from "vitest";
import type { RemotePlayer } from "@standin/contracts";
import {
    applySpacePositions,
    createSpacePositionsState,
    drawInSight,
} from "../applySpacePositions";

const peer = {
    socketId: "sock-a",
    userId: "user-a",
    name: "A",
    avatarSheetFileId: null,
    profilePictureUrl: null,
} as unknown as RemotePlayer;

const build = () => ({
    removeRemoteAvatar: vi.fn(),
    spawnRemoteAvatar: vi.fn(),
    applyRemotePosition: vi.fn(),
});

const buildState = (withPeer = true) => {
    const state = createSpacePositionsState();
    if (withPeer) state.roster.set("sock-a", peer);
    return state;
};

describe("applySpacePositions", () => {
    it("spawns on entered and learns the short id", () => {
        const target = build();
        const state = buildState();

        applySpacePositions(
            { entered: [[1, 10, 20, 1, "sock-a"]], moved: [], left: [] },
            state,
            target
        );

        expect(state.shortIds.get(1)).toBe("sock-a");
        expect(state.inSight.get("sock-a")).toMatchObject({ x: 10, y: 20 });
        expect(target.spawnRemoteAvatar).toHaveBeenCalledOnce();
        expect(target.applyRemotePosition).toHaveBeenCalledWith(
            "sock-a",
            expect.objectContaining({ x: 10, y: 20 })
        );
    });

    it("moves a known short id and skips an unknown one", () => {
        const target = build();
        const state = buildState();
        state.shortIds.set(1, "sock-a");

        applySpacePositions(
            {
                entered: [],
                moved: [
                    [1, 11, 21, 1],
                    [9, 5, 5, 1],
                ],
                left: [],
            },
            state,
            target
        );

        expect(target.applyRemotePosition).toHaveBeenCalledOnce();
        expect(target.applyRemotePosition).toHaveBeenCalledWith(
            "sock-a",
            expect.objectContaining({ x: 11, y: 21 })
        );
        expect(state.inSight.get("sock-a")).toMatchObject({ x: 11, y: 21 });
    });

    it("removes the avatar on left and forgets the short id and the sighting", () => {
        const target = build();
        const state = buildState();
        state.shortIds.set(1, "sock-a");
        state.inSight.set("sock-a", { x: 1, y: 1, direction: "up", isSitting: false });

        applySpacePositions(
            { entered: [], moved: [], left: [1, 2] },
            state,
            target
        );

        expect(target.removeRemoteAvatar).toHaveBeenCalledOnce();
        expect(target.removeRemoteAvatar).toHaveBeenCalledWith("sock-a");
        expect(state.shortIds.size).toBe(0);
        expect(state.inSight.size).toBe(0);
    });

    it("keeps what arrives before the scene is ready and draws it afterwards", () => {
        const state = buildState();

        applySpacePositions(
            {
                entered: [[1, 10, 20, 1, "sock-a"]],
                moved: [[1, 12, 22, 1]],
                left: [],
            },
            state,
            null
        );

        const target = build();
        drawInSight(state, target);

        expect(target.spawnRemoteAvatar).toHaveBeenCalledOnce();
        expect(target.applyRemotePosition).toHaveBeenCalledWith(
            "sock-a",
            expect.objectContaining({ x: 12, y: 22 })
        );
    });

    it("draws someone whose roster entry came after the sighting", () => {
        const state = buildState(false);
        applySpacePositions(
            { entered: [[1, 10, 20, 1, "sock-a"]], moved: [], left: [] },
            state,
            build()
        );
        const target = build();
        drawInSight(state, target);
        expect(target.spawnRemoteAvatar).not.toHaveBeenCalled();

        state.roster.set("sock-a", peer);
        drawInSight(state, target);

        expect(target.spawnRemoteAvatar).toHaveBeenCalledOnce();
    });
});
