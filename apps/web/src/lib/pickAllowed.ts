// Keeps a stored value when it is one of the allowed ones, else the fallback.
export const pickAllowed = <T extends string>(
    stored: unknown,
    allowed: readonly T[],
    fallback: T
): T => allowed.find((option) => option === stored) ?? fallback;
