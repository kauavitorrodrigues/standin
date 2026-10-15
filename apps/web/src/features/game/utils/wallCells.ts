export type WallCells = ReadonlySet<string>;

export const getCellKey = (column: number, row: number): string =>
    `${column},${row}`;

type TileRows = readonly (readonly { index: number }[])[];

// The cells with a tile on the walls layer. The game has no tile metadata, so
// any tile there is taken as a wall, solid or not.
export const buildWallCells = (rows: TileRows): WallCells => {
    const cells = new Set<string>();
    rows.forEach((tiles, row) => {
        tiles.forEach((tile, column) => {
            if (tile.index > 0) cells.add(getCellKey(column, row));
        });
    });
    return cells;
};
