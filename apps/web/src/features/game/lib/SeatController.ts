import type { Player } from "@/features/game/lib/Player";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

// Sits the avatar that comes to rest on a seat of a piece, with no key. The piece does not block the way, so walking across it keeps
// the avatar on its feet: it only sits once no movement key is pressed while
// it is over the footprint. After standing up the avatar has to leave the
// footprint before it can sit again, or it would sit back at once. A seat
// holds one avatar: the taken ones are skipped, and when none is free the
// avatar stays on its feet.
// The position is the anchor of the avatar (its feet), and the seat is the
// point where the anchor goes. It is checked every frame, not from the
// overlaps of the physics, which only run on the frames that step it.
export type SeatedPlayer = Pick<
    Player,
    "x" | "y" | "isSitting" | "moveAxis" | "sitAt" | "standUp" | "teleportTo"
>;

// What the controller asks of the other avatars of the space.
export type SeatRules = {
    // Another avatar is sat on the seat.
    isTaken: (seat: SeatSpot) => boolean;
    // Another avatar sat on the same seat at the same time and wins the tie.
    mustYield: (seat: SeatSpot) => boolean;
    // The seat is inside something solid, so nobody can sit there.
    isBlocked?: (seat: SeatSpot) => boolean;
};

const NO_RULES: SeatRules = {
    isTaken: () => false,
    mustYield: () => false,
};

export class SeatController {
    private readonly player: SeatedPlayer;
    private readonly rules: SeatRules;
    private areas: SeatArea[] = [];
    private armed = true;
    // The seat the avatar was sat at, to tell when its piece went away.
    private seat: SeatSpot | null = null;
    private area: SeatArea | null = null;
    // Where the feet were when it sat, to put it back if it loses the seat.
    private restPoint: { x: number; y: number } | null = null;

    constructor(player: SeatedPlayer, rules: SeatRules = NO_RULES) {
        this.player = player;
        this.rules = rules;
    }

    // Swaps the seats for the ones of the objects now on the map. An avatar
    // sat on a seat that is gone (piece deleted or moved) gets up on the spot.
    setAreas(areas: SeatArea[]): void {
        this.areas = areas;
        if (!this.player.isSitting || this.hasSeat(this.seat)) return;

        this.seat = null;
        this.armed = false;
        this.player.standUp();
    }

    private hasSeat(seat: SeatSpot | null): boolean {
        if (!seat) return false;

        return this.areas.some((area) =>
            area.seats.some((spot) => spot.x === seat.x && spot.y === seat.y)
        );
    }

    // A seat nobody holds and nothing blocks.
    private isFree = (spot: SeatSpot): boolean =>
        !this.rules.isTaken(spot) && !this.rules.isBlocked?.(spot);

    // Whether the avatar would sit as soon as it rests: on its feet over a
    // piece, with the way in still armed and a free seat. The movement code
    // asks it, so a tap does not turn the avatar for a frame before it sits.
    canSitHere(): boolean {
        if (this.player.isSitting || !this.armed) return false;

        const area = this.findAreaUnderPlayer();
        return area !== null && area.seats.some(this.isFree);
    }

    private findAreaUnderPlayer(): SeatArea | null {
        return (
            this.areas.find((area) =>
                isWithinReach(area.footprint, this.player, 0)
            ) ?? null
        );
    }

    // Two avatars that sat on the same seat before seeing each other: the one
    // that loses the tie takes another free seat of the piece, or gets up and
    // goes back to where it was. It never stays standing on the seat, where it
    // would draw behind the piece.
    private yieldSeatIfLost(): void {
        const { seat, area } = this;
        if (!seat || !area || !this.rules.mustYield(seat)) return;

        const free = area.seats.filter(
            (spot) => spot !== seat && this.isFree(spot)
        );
        const other = findNearestSeat(free, this.player);
        if (other) {
            this.seat = other;
            this.player.sitAt(other);
            return;
        }

        const back = this.restPoint;
        this.seat = null;
        this.armed = false;
        this.player.standUp();
        if (back) this.player.teleportTo(back.x, back.y);
    }

    update(): void {
        if (this.player.isSitting) {
            this.yieldSeatIfLost();
            return;
        }

        const area = this.findAreaUnderPlayer();
        if (!area) {
            this.armed = true;
            return;
        }

        const { x, y } = this.player.moveAxis;
        const isResting = x === 0 && y === 0;
        if (!this.armed || !isResting) return;

        const freeSeats = area.seats.filter(this.isFree);
        const seat = findNearestSeat(freeSeats, this.player);
        // Every seat of the piece is taken: the avatar has to leave and come
        // back, so it does not sit by surprise when someone gets up.
        this.armed = false;
        if (!seat) return;

        this.seat = seat;
        this.area = area;
        this.restPoint = { x: this.player.x, y: this.player.y };
        this.player.sitAt(seat);
    }
}
