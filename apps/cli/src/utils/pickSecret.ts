// Like pickOption, but the value is kept as typed: a password may start or
// end with a space.
export const pickSecret = (
    flag: string | undefined,
    fromEnv: string | undefined
): string | undefined => flag || fromEnv || undefined;
