// What a script or an agent reads after the command ended.
export const EXIT_CODES = {
    OK: 0,
    INTERNAL: 1,
    USAGE: 2,
    VALIDATION: 3,
    AUTH: 4,
    NETWORK: 5,
    CONFLICT: 6,
} as const;
