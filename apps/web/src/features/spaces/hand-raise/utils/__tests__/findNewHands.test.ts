import { describe, expect, it } from "vitest";
import type { SpaceRaisedHand } from "@standin/contracts";
import { findNewHands } from "../findNewHands";

const make = (socketId: string): SpaceRaisedHand => ({
    socketId,
    userId: `user-${socketId}`,
    raisedSince: 1,
});

describe("findNewHands", () => {
    it("finds a socket that was not in the previous list", () => {
        expect(findNewHands([make("a")], [make("a"), make("b")])).toEqual([
            make("b"),
        ]);
    });

    it("finds everybody when the previous list was empty", () => {
        expect(findNewHands([], [make("a")])).toEqual([make("a")]);
    });

    it("finds nobody when the same hands remain", () => {
        expect(findNewHands([make("a")], [make("a")])).toEqual([]);
    });

    it("finds nobody when a hand only went down", () => {
        expect(findNewHands([make("a"), make("b")], [make("b")])).toEqual([]);
    });
});
