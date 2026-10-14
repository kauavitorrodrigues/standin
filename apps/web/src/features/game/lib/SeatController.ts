import type { Player } from "@/features/game/lib/Player";
import type { SeatArea } from "@/features/game/utils/buildSeatAreas";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

// Sits the avatar that comes to rest on a seat of a piece, with no key, like
// Gather does. The piece does not block the way, so walking across it keeps
// the avatar on its feet: it only sits once no movement key is pressed while
// it is over the footprint. After standing up the avatar has to leave the
// footprint before it can sit again, or it would sit back at once.
// The position is checked every frame, not from the overlaps of the physics,
// which only run on the frames that step it.
export class SeatController {
    private readonly player: Player;
    private areas: SeatArea[] = [];
    private armed = true;

    constructor(player: Player) {
        this.player = player;
    }

    addAreas(areas: SeatArea[]): void {
        this.areas = [...this.areas, ...areas];
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
        this.player.sitAt(seat);
    }
}
