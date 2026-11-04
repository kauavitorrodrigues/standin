import { describe, expect, it } from "vitest";
import type { SpaceAnnouncer } from "@standin/contracts";
import {
    announcingReducer,
    INITIAL_ANNOUNCING_STATE,
} from "../announcingState";

const ana: SpaceAnnouncer = {
    socketId: "s1",
    userId: "ana",
    announcingSince: 1,
};
const bia: SpaceAnnouncer = {
    socketId: "s2",
    userId: "bia",
    announcingSince: 2,
};

describe("announcingReducer", () => {
    it("starts with nobody announcing", () => {
        expect(INITIAL_ANNOUNCING_STATE).toEqual({
            announcers: [],
            announcingSince: null,
        });
    });

    it("keeps the list as received, in the same order", () => {
        const state = announcingReducer(INITIAL_ANNOUNCING_STATE, {
            type: "announcers-received",
            announcers: [bia, ana],
        });

        expect(state.announcers).toEqual([bia, ana]);
    });

    it("replaces the whole list, an empty one meaning nobody", () => {
        const withList = announcingReducer(INITIAL_ANNOUNCING_STATE, {
            type: "announcers-received",
            announcers: [ana],
        });
        const state = announcingReducer(withList, {
            type: "announcers-received",
            announcers: [],
        });

        expect(state.announcers).toEqual([]);
    });

    it("keeps my own state apart from the list", () => {
        const mine = announcingReducer(INITIAL_ANNOUNCING_STATE, {
            type: "own-state-set",
            announcingSince: 99,
        });
        const state = announcingReducer(mine, {
            type: "announcers-received",
            announcers: [ana],
        });

        expect(state).toEqual({ announcers: [ana], announcingSince: 99 });
    });

    it("resets both on a rejoin", () => {
        const busy = { announcers: [ana], announcingSince: 5 };

        expect(announcingReducer(busy, { type: "reset" })).toEqual(
            INITIAL_ANNOUNCING_STATE
        );
    });
});
