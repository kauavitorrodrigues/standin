import { MAX_SPACE_CAPACITY } from "./constants";
import { MAP_SIZE_TIERS } from "../enums/map-size-tier";

export const SIZE_TIERS = {
    [MAP_SIZE_TIERS.XS]: {
        minPeople: 2,
        maxPeople: 6,
        maxWidth: 24,
        maxHeight: 16,
    },
    [MAP_SIZE_TIERS.S]: {
        minPeople: 7,
        maxPeople: 10,
        maxWidth: 30,
        maxHeight: 20,
    },
    [MAP_SIZE_TIERS.M]: {
        minPeople: 11,
        maxPeople: 25,
        maxWidth: 48,
        maxHeight: 32,
    },
    [MAP_SIZE_TIERS.L]: {
        minPeople: 26,
        maxPeople: 50,
        maxWidth: 64,
        maxHeight: 48,
    },
    [MAP_SIZE_TIERS.XL]: {
        minPeople: 51,
        maxPeople: MAX_SPACE_CAPACITY,
        maxWidth: 100,
        maxHeight: 100,
    },
} as const;

export type SizeTier = keyof typeof SIZE_TIERS;

// A tier is enabled when its smallest group fits in one space.
export const ENABLED_SIZE_TIERS = (
    Object.keys(SIZE_TIERS) as SizeTier[]
).filter((tier) => SIZE_TIERS[tier].minPeople <= MAX_SPACE_CAPACITY);
