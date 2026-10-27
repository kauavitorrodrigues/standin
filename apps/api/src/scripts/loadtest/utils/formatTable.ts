// Plain text table, columns padded to the widest cell.
export const formatTable = (header: string[], rows: string[][]): string => {
    const widths = header.map((title, column) =>
        Math.max(title.length, ...rows.map((row) => row[column].length))
    );
    const line = (cells: string[]) =>
        cells.map((cell, column) => cell.padStart(widths[column])).join("  ");
    const rule = widths.map((width) => "-".repeat(width)).join("  ");
    return [line(header), rule, ...rows.map(line)].join("\n");
};
