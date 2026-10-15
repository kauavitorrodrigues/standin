import type { TileConflict } from "@standin/contracts";
import { TILE_HINTS } from "@/features/editor/consts/messages";
import { getConflictReason } from "@/features/editor/utils/getConflictReason";
import { pluralize } from "@/features/editor/utils/pluralize";

// "2 células ignoradas: há um objeto sobre a célula". Null with no conflict.
export const getConflictHint = (
    conflicts: readonly TileConflict[]
): string | null => {
    if (conflicts.length === 0) return null;

    const reasons = [
        ...new Set(conflicts.map(({ code }) => getConflictReason(code))),
    ];
    const count = pluralize(
        conflicts.length,
        TILE_HINTS.CELL_SINGULAR,
        TILE_HINTS.CELL_PLURAL
    );
    return `${count}: ${reasons.join("; ")}`;
};
