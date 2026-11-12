import { describe, expect, it } from "vitest";
import { WAVE } from "@/features/emotes/consts/wave";
import { resolveWaveState } from "../resolveWaveState";

describe("resolveWaveState", () => {
    it("is idle when no wave was sent", () => {
        expect(resolveWaveState({ sentAt: null }, 0)).toEqual({
            isCoolingDown: false,
            nextChangeMs: null,
        });
    });

    it("cools down right after a wave was sent", () => {
        const state = resolveWaveState({ sentAt: 100 }, 100);

        expect(state.isCoolingDown).toBe(true);
        expect(state.nextChangeMs).toBe(WAVE.SEND_COOLDOWN_MS);
    });

    it("tells how long the cooldown has left", () => {
        const state = resolveWaveState({ sentAt: 0 }, 1000);

        expect(state.nextChangeMs).toBe(WAVE.SEND_COOLDOWN_MS - 1000);
    });

    it("stops cooling down once the cooldown is over", () => {
        const state = resolveWaveState({ sentAt: 0 }, WAVE.SEND_COOLDOWN_MS);

        expect(state).toEqual({ isCoolingDown: false, nextChangeMs: null });
    });
});
