// Splits a list in rows of `size` items. It is how the virtual list gets one
// element per row of the grid.
export const chunkRows = <T>(items: readonly T[], size: number): T[][] => {
    const rows: T[][] = [];
    for (let start = 0; start < items.length; start += size) {
        rows.push(items.slice(start, start + size));
    }
    return rows;
};
