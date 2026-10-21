import { describe, expect, it } from "vitest";
import { EMOTE_DURATION_MS } from "@/features/game/consts/emote";
import { EmoteState } from "../EmoteState";

describe("EmoteState", () => {
    it("is not emoting before it is played", () => {
        expect(new EmoteState().update(0, true)).toBe(false);
    });

    it("gestures for the duration of the animation", () => {
        const state = new EmoteState();
        state.play(100);

        expect(state.update(100, true)).toBe(true);
        expect(state.update(100 + EMOTE_DURATION_MS - 1, true)).toBe(true);
        expect(state.update(100 + EMOTE_DURATION_MS, true)).toBe(false);
    });

    it("stops at once when the avatar can not emote, and stays stopped", () => {
        const state = new EmoteState();
        state.play(0);

        expect(state.update(10, false)).toBe(false);
        expect(state.update(20, true)).toBe(false);
    });
});
