import { DANCE_MAX_MS } from "@standin/contracts";
import type { DanceSpot } from "@/features/game/types/dance";

const isSameSpot = (a: DanceSpot, b: DanceSpot): boolean =>
    Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);

/**
 * Whether the local avatar is dancing. The key holds it: it starts when the
 * key goes down on an avatar that stands still, and ends on release, on a step,
 * a seat or a jump to another spot (a teleport), or at the cap. Shared by the
 * scene and the tests, with no Phaser.
 */
export class DanceState {
    private startedAt: number | null = null;
    private spot: DanceSpot | null = null;

    get isActive(): boolean {
        return this.startedAt !== null;
    }

    // `now` is the scene time in ms. Returns whether the dance is on.
    start(now: number, canDance: boolean, spot: DanceSpot): boolean {
        if (this.startedAt !== null) return true;
        if (!canDance) return false;

        this.startedAt = now;
        this.spot = { x: spot.x, y: spot.y };
        return true;
    }

    stop(): void {
        this.startedAt = null;
        this.spot = null;
    }

    // Called every frame. Ends the dance when the avatar can no longer do it,
    // when it is not where it began (the server ends it there too), or when it
    // has gone on for the whole cap. Returns whether it is on.
    update(now: number, canDance: boolean, spot: DanceSpot): boolean {
        if (this.startedAt === null || this.spot === null) return false;

        const isOver =
            !canDance ||
            !isSameSpot(this.spot, spot) ||
            now - this.startedAt >= DANCE_MAX_MS;
        if (!isOver) return true;

        this.stop();
        return false;
    }
}
