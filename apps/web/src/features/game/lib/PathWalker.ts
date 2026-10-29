import { PATH_SEARCH } from "@/features/game/consts/click-move";
import { isSameCell } from "@/features/game/utils/cell";
import type { Cell } from "@/features/game/types/cell";
import type { TileDirection } from "@/features/game/lib/TileMover";

// Holds the tiles of a double click walk and says which way to go from each
// one. It does not move anything: the mover asks it for the next direction
// every time the avatar stands on a tile, the way a key would be held, and
// when the avatar is not on the way anymore, or the next tile closed, the walk
// is handed back to be planned again from where the avatar is.
export class PathWalker {
    private route: Cell[] = [];
    // Calls in a row that found the avatar off the way.
    private offRouteTicks = 0;

    isWalking(): boolean {
        return this.route.length > 0;
    }

    // The tile the walk ends on, null with no walk.
    getDestination(): Cell | null {
        return this.route[this.route.length - 1] ?? null;
    }

    start(route: readonly Cell[]): void {
        this.route = [...route];
        this.offRouteTicks = 0;
    }

    cancel(): void {
        this.route = [];
        this.offRouteTicks = 0;
    }

    // The direction from the tile to the next one of the walk. It is null, and
    // the walk is over, on the last tile. On a tile that is not on the way it is
    // null too, but the walk is kept for a few calls in a row, since a nudge
    // can put the avatar off the way for a moment, and it goes on when the
    // avatar is back on it.
    next = (cell: Cell): TileDirection | null => {
        const index = this.route.findIndex((step) => isSameCell(step, cell));
        if (index < 0) {
            this.offRouteTicks += 1;
            if (this.offRouteTicks >= PATH_SEARCH.OFF_ROUTE_TICKS)
                this.cancel();
            return null;
        }

        this.offRouteTicks = 0;
        const after = this.route[index + 1];
        if (!after) {
            this.cancel();
            return null;
        }

        return {
            x: after.column - cell.column,
            y: after.row - cell.row,
        };
    };
}
