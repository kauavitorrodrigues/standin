import type { Player } from "@/features/game/lib/Player";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

// Sits the avatar that comes to rest on a seat of a piece, with no key, like
// Gather does. The piece does not block the way, so walking across it keeps
// the avatar on its feet: it only sits once no movement key is pressed while
// it is over the footprint. After standing up the avatar has to leave the
// footprint before it can sit again, or it would sit back at once.
// The position is checked every frame, not from the overlaps of the physics,
// which only run on the frames that step it.
export type SeatedPlayer = Pick<
    Player,
    "x" | "y" | "isSitting" | "moveAxis" | "sitAt" | "standUp"
>;

export class SeatController {
    private readonly player: SeatedPlayer;
    private areas: SeatArea[] = [];
    private armed = true;
    // The seat the avatar was sat at, to tell when its piece went away.
    private seat: SeatSpot | null = null;

    constructor(player: SeatedPlayer) {
        this.player = player;
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

    private findAreaUnderPlayer(): SeatArea | null {
        return (
            this.areas.find((area) =>
                isWithinReach(area.footprint, this.player, 0)
            ) ?? null
        );
    }

    update(): void {
        if (this.player.isSitting) return;

        const area = this.findAreaUnderPlayer();
        if (!area) {
            this.armed = true;
            return;
        }

        const { x, y } = this.player.moveAxis;
        const isResting = x === 0 && y === 0;
        if (!this.armed || !isResting) return;

        const seat = findNearestSeat(area.seats, this.player);
        if (!seat) return;

        this.armed = false;
        this.seat = seat;
        this.player.sitAt(seat);
    }
}
