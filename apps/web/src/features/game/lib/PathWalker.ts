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

    isWalking(): boolean {
        return this.route.length > 0;
    }

    // The tile the walk ends on, null with no walk.
    getDestination(): Cell | null {
        return this.route[this.route.length - 1] ?? null;
    }

    start(route: readonly Cell[]): void {
        this.route = [...route];
    }

    cancel(): void {
        this.route = [];
    }

    // The direction from the tile to the next one of the walk. It is null, and
    // the walk is over, on the last tile and on a tile that is not on the way.
    next = (cell: Cell): TileDirection | null => {
        const index = this.route.findIndex((step) => isSameCell(step, cell));
        const after = this.route[index + 1];
        if (index < 0 || !after) {
            this.cancel();
            return null;
        }

        return {
            x: after.column - cell.column,
            y: after.row - cell.row,
        };
    };
}
