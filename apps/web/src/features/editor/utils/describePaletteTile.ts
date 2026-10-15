import { WALL_PIECE_LABELS } from "@/features/editor/consts/wall-piece-labels";
import type { PaletteTile } from "@/features/editor/types/palette-tile";

// What a palette tile says about itself when the pointer rests on it: the
// category and index, or the name of the wall style and what it still lacks.
export const describePaletteTile = (
    tile: PaletteTile,
    categoryLabel: string
): string => {
    const { style } = tile;
    if (!style) return `${categoryLabel} ${tile.index}`;
    if (style.missing.length === 0) return `Parede ${style.name}`;

    const missing = style.missing
        .map(
            (piece) =>
                WALL_PIECE_LABELS[piece as keyof typeof WALL_PIECE_LABELS]
        )
        .join(", ");
    return `Parede ${style.name} incompleta, falta: ${missing}`;
};
