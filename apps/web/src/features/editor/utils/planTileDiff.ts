import type { CellDiff } from "@standin/contracts";
import type { TileLayerPlan } from "@/features/editor/types/tile-plan";

const EMPTY_GID = 0;

/**
 * Groups a cell diff by layer into the calls to make: a put for a cell that
 * now has a tile and a remove for one that became empty.
 */
export const planTileDiff = (diff: readonly CellDiff[]): TileLayerPlan[] => {
    const plans = new Map<string, TileLayerPlan>();

    for (const cell of diff) {
        const plan = plans.get(cell.layer) ?? {
            layer: cell.layer,
            puts: [],
            removes: [],
        };
        plans.set(cell.layer, plan);

        if (cell.after === EMPTY_GID) {
            plan.removes.push({ x: cell.x, y: cell.y });
            continue;
        }
        plan.puts.push({ x: cell.x, y: cell.y, gid: cell.after });
    }

    return [...plans.values()];
};
