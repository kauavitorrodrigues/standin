import type { SelectionMode } from "../../types/sheet";

// What is selected once `picked` joins `base` the way the mode says.
export const combineSelection = (
    base: number[],
    picked: number[],
    mode: SelectionMode
): number[] => {
    switch (mode) {
        case "add":
            return [...new Set([...base, ...picked])];
        case "subtract": {
            const taken = new Set(picked);
            return base.filter((index) => !taken.has(index));
        }
        case "intersect": {
            const both = new Set(picked);
            return base.filter((index) => both.has(index));
        }
        case "replace":
            return picked;
    }
};
