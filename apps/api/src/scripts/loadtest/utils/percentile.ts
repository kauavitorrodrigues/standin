// Nearest-rank percentile of a list of numbers. 0 for an empty list.
export const percentile = (values: number[], percent: number): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const rank = Math.ceil((percent / 100) * sorted.length);
    return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
};
