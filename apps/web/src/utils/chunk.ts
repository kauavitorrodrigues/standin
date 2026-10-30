/** The items cut into rows of `size`, the last one possibly shorter. */
export const chunk = <T>(items: readonly T[], size: number): T[][] => {
    const rows: T[][] = [];
    for (let start = 0; start < items.length; start += size) {
        rows.push(items.slice(start, start + size));
    }
    return rows;
};
