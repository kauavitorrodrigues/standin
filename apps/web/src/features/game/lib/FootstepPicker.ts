import { FOOTSTEP_THROTTLE_MS } from "@/features/game/consts/footsteps";

type PlayerMemory = { at: number; take: number };

/**
 * Decides when a player makes a step sound and which take it is. A player
 * sounds at most once in the throttle window, and never the same take twice
 * in a row, so a walk does not machine-gun one file.
 */
export class FootstepPicker {
    private readonly memory = new Map<string, PlayerMemory>();
    private readonly takeCount: number;
    private readonly throttleMs: number;

    constructor(takeCount: number, throttleMs: number = FOOTSTEP_THROTTLE_MS) {
        this.takeCount = takeCount;
        this.throttleMs = throttleMs;
    }

    // `now` is the scene time in ms and `random` gives 0 up to 1. Returns the
    // take (0-based) to play, or null while the player is throttled.
    pick(playerId: string, now: number, random: () => number): number | null {
        const last = this.memory.get(playerId);
        if (last && now - last.at < this.throttleMs) return null;

        const take = this.chooseTake(last?.take, random);
        this.memory.set(playerId, { at: now, take });
        return take;
    }

    remove(playerId: string): void {
        this.memory.delete(playerId);
    }

    clear(): void {
        this.memory.clear();
    }

    // Draws among the other takes: one slot is left out, and the draws at or
    // above the last take move up by one to skip it.
    private chooseTake(last: number | undefined, random: () => number): number {
        if (last === undefined || this.takeCount < 2) {
            return Math.floor(random() * this.takeCount);
        }

        const draw = Math.floor(random() * (this.takeCount - 1));
        return draw >= last ? draw + 1 : draw;
    }
}
