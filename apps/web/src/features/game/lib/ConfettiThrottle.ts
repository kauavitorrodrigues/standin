import { CONFETTI_THROTTLE_MS } from "@/features/game/consts/confetti";

/**
 * Lets the key throw confetti at most once per window. The first press goes
 * out at once (leading) and the ones inside the window are dropped, so holding
 * the key does not flood the room. No React and no Phaser.
 */
export class ConfettiThrottle {
    private readonly dispatch: () => void;
    private readonly now: () => number;
    private lastAt = Number.NEGATIVE_INFINITY;

    constructor(dispatch: () => void, now: () => number = Date.now) {
        this.dispatch = dispatch;
        this.now = now;
    }

    fire(): void {
        const at = this.now();
        if (at - this.lastAt < CONFETTI_THROTTLE_MS) return;

        this.lastAt = at;
        this.dispatch();
    }
}
