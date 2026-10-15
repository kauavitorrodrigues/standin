import type { ImageSize } from "@/features/assets/queries/useImageSize";
import type { TileSheetGrid } from "../../types/sheet";

type Props = {
    size: ImageSize | undefined;
    grid: TileSheetGrid | null;
};

// What the sheet reads as: its columns, rows and tiles, or why it does not
// read at all.
export const TilesetGridValue = ({ size, grid }: Props) => {
    if (!size) return <>Lendo...</>;
    if (!grid) return <>Não divide em células de 32 px</>;
    return (
        <>
            {grid.columns} × {grid.rows} ({grid.tileCount} tiles)
        </>
    );
};
