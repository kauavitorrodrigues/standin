export const AREA_VALUES = {
    SPACES: "spaces",
    LIBRARY: "library",
} as const;

export type Area = (typeof AREA_VALUES)[keyof typeof AREA_VALUES];

export const AREA_ROUTES = {
    [AREA_VALUES.SPACES]: "/home",
    [AREA_VALUES.LIBRARY]: "/library/assets",
} as const;
