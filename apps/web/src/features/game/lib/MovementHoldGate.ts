import { MOVEMENT_HOLD } from "@/features/game/consts/movement-hold";

// Decides when a held movement key turns into walking. A key has to be held
// for the hold delay first, so a tap only turns the avatar. Pressing a new
// key right after walking skips the wait, so a change of direction keeps the
// avatar going.
export class MovementHoldGate {
    private intent: string | null = null;
    private heldSince = 0;
    private lastWalkingAt = Number.NEGATIVE_INFINITY;

    // `intent` names what the keys ask for right now, null for nothing. It
    // returns whether the avatar walks at `now`, in ms.
    update(now: number, intent: string | null): boolean {
        if (intent === null) {
            this.intent = null;
            return false;
        }

        if (intent !== this.intent) {
            this.intent = intent;
            this.heldSince = now;
        }

        const isChained =
            now - this.lastWalkingAt <= MOVEMENT_HOLD.CHAIN_GRACE_MS;
        const isHeldLongEnough = now - this.heldSince >= MOVEMENT_HOLD.DELAY_MS;
        const isWalking = isChained || isHeldLongEnough;
        if (isWalking) this.lastWalkingAt = now;

        return isWalking;
    }

    reset(): void {
        this.intent = null;
        this.lastWalkingAt = Number.NEGATIVE_INFINITY;
    }
}
