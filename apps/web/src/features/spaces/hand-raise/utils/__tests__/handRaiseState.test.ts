import { describe, expect, it } from "vitest";
import type { SpaceRaisedHand } from "@standin/contracts";
import { handRaiseReducer, INITIAL_HAND_RAISE_STATE } from "../handRaiseState";

const ana: SpaceRaisedHand = { socketId: "s1", userId: "ana", raisedSince: 1 };
const bia: SpaceRaisedHand = { socketId: "s2", userId: "bia", raisedSince: 2 };

describe("handRaiseReducer", () => {
    it("starts with every hand down", () => {
        expect(INITIAL_HAND_RAISE_STATE).toEqual({
            hands: [],
            raisedSince: null,
        });
    });

    it("keeps the list as received, in the same order", () => {
        const state = handRaiseReducer(INITIAL_HAND_RAISE_STATE, {
            type: "hands-received",
            hands: [bia, ana],
        });

        expect(state.hands).toEqual([bia, ana]);
    });

    it("keeps my own hand apart from the list", () => {
        const received = handRaiseReducer(INITIAL_HAND_RAISE_STATE, {
            type: "hands-received",
            hands: [ana],
        });
        const raised = handRaiseReducer(received, {
            type: "own-state-set",
            raisedSince: 10,
        });

        expect(raised).toEqual({ hands: [ana], raisedSince: 10 });
    });

    it("forgets everything on a reset", () => {
        const state = handRaiseReducer(
            { hands: [ana], raisedSince: 10 },
            { type: "reset" }
        );

        expect(state).toEqual(INITIAL_HAND_RAISE_STATE);
    });
});
