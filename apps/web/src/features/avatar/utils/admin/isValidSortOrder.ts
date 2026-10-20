// The position of a category is a whole number from 0.
export const isValidSortOrder = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;
