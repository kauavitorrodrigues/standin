// The two stops of the page that creates a space: the size comes first, the
// map of that size second.
export const CREATE_STEPS = {
    SIZE: "size",
    MAP: "map",
} as const;

export type CreateStep = (typeof CREATE_STEPS)[keyof typeof CREATE_STEPS];
