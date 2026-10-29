/** The positions of the values that already appeared earlier in the list. */
export const findRepeatedIndexes = (values: readonly string[]): number[] => {
    const seen = new Set<string>();
    return values.flatMap((value, index) => {
        if (seen.has(value)) return [index];
        seen.add(value);
        return [];
    });
};
