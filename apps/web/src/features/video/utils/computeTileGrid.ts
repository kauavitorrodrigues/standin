export type TileGrid = {
    columns: number;
    tileWidth: number;
    tileHeight: number;
};

type TileGridInput = {
    count: number;
    width: number;
    height: number;
    gap: number;
    aspectRatio: number;
    // 0 to 1. A layout with more columns is preferred as long as its tiles
    // are at least this fraction of the largest possible size, so two tiles
    // sit side by side instead of stacking for a few pixels of gain.
    widthTolerance: number;
};

const EMPTY_GRID: TileGrid = { columns: 1, tileWidth: 0, tileHeight: 0 };

// Picks the column count that makes the tiles as large as possible while
// every one of them still fits inside the box, with no scrolling. This is
// what makes the tiles shrink as the window does (the way Discord's call
// grid behaves) instead of overflowing.
export const computeTileGrid = ({
    count,
    width,
    height,
    gap,
    aspectRatio,
    widthTolerance,
}: TileGridInput): TileGrid => {
    if (count <= 0 || width <= 0 || height <= 0) return EMPTY_GRID;

    const candidates: TileGrid[] = [];

    for (let columns = 1; columns <= count; columns++) {
        const rows = Math.ceil(count / columns);
        const maxWidth = (width - gap * (columns - 1)) / columns;
        const maxHeight = (height - gap * (rows - 1)) / rows;
        const tileWidth = Math.floor(
            Math.max(0, Math.min(maxWidth, maxHeight * aspectRatio))
        );

        candidates.push({
            columns,
            tileWidth,
            tileHeight: Math.floor(tileWidth / aspectRatio),
        });
    }

    const largest = Math.max(...candidates.map((grid) => grid.tileWidth));
    if (largest <= 0) return EMPTY_GRID;

    // Among the layouts close enough to the largest, the widest one wins.
    return candidates
        .filter((grid) => grid.tileWidth >= largest * widthTolerance)
        .reduce((best, grid) => (grid.columns > best.columns ? grid : best));
};
