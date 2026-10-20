import { describe, expect, it } from "vitest";
import { MOVEMENT_HOLD } from "@/features/game/consts/movement-hold";
import { MovementHoldGate } from "@/features/game/lib/MovementHoldGate";

const LEFT = "-1,0";
const UP = "0,-1";

describe("MovementHoldGate", () => {
    it("does not walk on a tap shorter than the hold delay", () => {
        const gate = new MovementHoldGate();

        expect(gate.update(0, LEFT)).toBe(false);
        expect(gate.update(MOVEMENT_HOLD.DELAY_MS - 1, LEFT)).toBe(false);
        expect(gate.update(MOVEMENT_HOLD.DELAY_MS, null)).toBe(false);
    });

    it("walks once the key has been held for the hold delay", () => {
        const gate = new MovementHoldGate();
        gate.update(0, LEFT);

        expect(gate.update(MOVEMENT_HOLD.DELAY_MS, LEFT)).toBe(true);
    });

    it("waits again for a key pressed after a stop", () => {
        const gate = new MovementHoldGate();
        gate.update(0, LEFT);
        gate.update(MOVEMENT_HOLD.DELAY_MS, LEFT);
        const stoppedAt =
            MOVEMENT_HOLD.DELAY_MS + MOVEMENT_HOLD.CHAIN_GRACE_MS + 1;
        gate.update(stoppedAt, null);

        expect(gate.update(stoppedAt + 1, UP)).toBe(false);
    });

    it("keeps walking when the direction changes right away", () => {
        const gate = new MovementHoldGate();
        gate.update(0, LEFT);
        gate.update(MOVEMENT_HOLD.DELAY_MS, LEFT);
        const changedAt = MOVEMENT_HOLD.DELAY_MS + 16;

        expect(gate.update(changedAt, UP)).toBe(true);
    });
});
